#!/bin/sh

set -e

playbook="$INPUT_PLAYBOOK"
key="$INPUT_KEY"
options="$INPUT_OPTIONS"

if test -z "$playbook"; then
    echo "You need to specify 'playbook' input (Ansible playbook filepath)"
    exit 1
fi

if test -z "$key"; then
    echo "You need to specify 'key' input (SSH private key)"
    exit 1
fi

mkdir -p "$HOME/.ssh"
echo "$key" > "$HOME/.ssh/id_rsa"
chmod 600 "$HOME/.ssh/id_rsa"

echo "$options"
echo "$playbook"

export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_FORCE_COLOR=True
export ANSIBLE_PRIVATE_KEY_FILE="$HOME/.ssh/id_rsa"

ansible-playbook $options $playbook