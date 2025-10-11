#!/bin/bash

# Create Lightsail Ubuntu VM for staging deployment
# Cost: $10/month (cheaper than container service)

set -e

INSTANCE_NAME="hi-staging-vm"
REGION="us-west-2"
ZONE="us-west-2a"

echo "🖥️  Creating Lightsail Ubuntu instance: $INSTANCE_NAME"

# Create the instance with SSH key
aws lightsail create-instances \
  --instance-names "$INSTANCE_NAME" \
  --availability-zone "$ZONE" \
  --blueprint-id ubuntu_22_04 \
  --bundle-id small_2_0 \
  --key-pair-name staging-key \
  --region "$REGION"

echo "⏳ Waiting for instance to be ready..."
sleep 60

# Get the instance IP
INSTANCE_IP=$(aws lightsail get-instance --instance-name "$INSTANCE_NAME" --region "$REGION" | jq -r '.instance.publicIpAddress')

echo "✅ Instance created!"
echo "🌐 Public IP: $INSTANCE_IP"
echo ""
echo "📝 Next steps:"
echo "1. Wait 2-3 minutes for instance to fully boot"
echo "2. Run: ./setup-staging-vm.sh $INSTANCE_IP"
echo ""
echo "🔑 SSH access:"
echo "   ssh ubuntu@$INSTANCE_IP"