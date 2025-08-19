#!/bin/bash

# Script to add a controller to the user payment canister
# Usage: ./add_controller.sh

CANISTER_ID="6tzcr-tqaaa-aaaag-aufoa-cai"
NEW_CONTROLLER="sgcpd-qxty4-z2lup-zshjk-kbqsr-kwnqn-iojka-qpze4-l6wba-dwph6-7ae"
FACTORY_CANISTER="zdfvs-baaaa-aaaag-acoeq-cai"

echo "Adding controller $NEW_CONTROLLER to canister $CANISTER_ID"

# First, let's get the current controllers
echo "Current controllers:"
dfx canister --network ic info $CANISTER_ID

# Use dfx to add the controller directly - we need to call this from the factory canister context
# Since the factory canister is the current controller, we need to execute this call as the factory

echo "Adding new controller..."
dfx canister --network ic call $FACTORY_CANISTER admin_add_controller_direct "($CANISTER_ID, principal \"$NEW_CONTROLLER\")"

echo "New controllers:"
dfx canister --network ic info $CANISTER_ID
