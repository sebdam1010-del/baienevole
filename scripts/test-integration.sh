#!/bin/bash

# Script de tests d'intégration pour BaieNévole
# Teste toutes les fonctionnalités critiques avant déploiement

set -e  # Arrêter si une commande échoue

echo "╔════════════════════════════════════════════╗"
echo "║  Tests d'intégration - BaieNévole          ║"
echo "╚════════════════════════════════════════════╝"
echo ""

API_URL="http://localhost:3000/api"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="Admin123!"
USER_EMAIL="user@test.com"
USER_PASSWORD="User123!"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓${NC} $2"
  else
    echo -e "${RED}✗${NC} $2"
    exit 1
  fi
}

echo "1. Test de santé API..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health || echo "000")
[ "$response" = "200" ] && test_result 0 "API accessible" || test_result 1 "API non accessible"

echo ""
echo "2. Test d'inscription..."
register_response=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\",
    \"nom\": \"Test\",
    \"prenom\": \"User\"
  }" 2>/dev/null)
http_code=$(echo "$register_response" | tail -n1)
[ "$http_code" = "201" ] || [ "$http_code" = "400" ] && test_result 0 "Inscription (nouveau ou existant)" || test_result 1 "Échec inscription"

echo ""
echo "3. Test de connexion..."
login_response=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$USER_EMAIL\",
    \"password\": \"$USER_PASSWORD\"
  }" 2>/dev/null)
TOKEN=$(echo $login_response | jq -r '.token' 2>/dev/null)
[ -n "$TOKEN" ] && [ "$TOKEN" != "null" ] && test_result 0 "Connexion réussie" || test_result 1 "Échec connexion"

echo ""
echo "4. Test récupération événements..."
events_response=$(curl -s -w "\n%{http_code}" $API_URL/events \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)
http_code=$(echo "$events_response" | tail -n1)
[ "$http_code" = "200" ] && test_result 0 "Liste événements accessible" || test_result 1 "Échec récupération événements"

echo ""
echo "5. Test profil bénévole..."
profile_response=$(curl -s -w "\n%{http_code}" $API_URL/benevoles/me \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)
http_code=$(echo "$profile_response" | tail -n1)
[ "$http_code" = "200" ] && test_result 0 "Profil accessible" || test_result 1 "Échec profil"

echo ""
echo "6. Test dashboard bénévole..."
dashboard_response=$(curl -s -w "\n%{http_code}" $API_URL/benevoles/dashboard \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)
http_code=$(echo "$dashboard_response" | tail -n1)
[ "$http_code" = "200" ] && test_result 0 "Dashboard accessible" || test_result 1 "Échec dashboard"

echo ""
echo "7. Test inscription à un événement..."
# Récupérer le premier événement disponible
EVENT_ID=$(curl -s $API_URL/events -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id' 2>/dev/null)
if [ -n "$EVENT_ID" ] && [ "$EVENT_ID" != "null" ]; then
  register_event_response=$(curl -s -w "\n%{http_code}" -X POST $API_URL/events/$EVENT_ID/register \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"poste": "accueil"}' 2>/dev/null)
  http_code=$(echo "$register_event_response" | tail -n1)
  [ "$http_code" = "201" ] || [ "$http_code" = "400" ] && test_result 0 "Inscription événement (nouveau ou existant)" || test_result 1 "Échec inscription événement"
else
  echo -e "${YELLOW}⊘${NC} Aucun événement disponible pour tester l'inscription"
fi

echo ""
echo "8. Test authentification invalide..."
invalid_login=$(curl -s -w "\n%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"wrong@email.com\",
    \"password\": \"WrongPassword\"
  }" 2>/dev/null)
http_code=$(echo "$invalid_login" | tail -n1)
[ "$http_code" = "401" ] && test_result 0 "Rejet authentification invalide" || test_result 1 "Échec rejet authentification"

echo ""
echo "9. Test accès non autorisé..."
unauthorized=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/benevoles/me 2>/dev/null)
[ "$unauthorized" = "401" ] && test_result 0 "Rejet accès sans token" || test_result 1 "Échec protection routes"

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  ✓ Tous les tests sont passés !            ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "La plateforme est prête pour le déploiement."
