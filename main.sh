#!/bin/sh

set -e

default_inventory="hosts"
default_vault_file=".vault_password"

playbook="$INPUT_PLAYBOOK"
directory="$INPUT_DIRECTORY"
key="$INPUT_KEY"
inventory="$INPUT_INVENTORY"
vault_password="$INPUT_VAULT_PASSWORD"
options="$INPUT_OPTIONS"

if test -z "$playbook"; then
    echo "You need to specify 'playbook' input (Ansible playbook filepath)"
    exit 1
fi

if test -z "$key"; then
    echo "You need to specify 'key' input (SSH private key)"
    exit 1
fi

if test -n "$directory"; then
    cd "$directory"
fi

mkdir -p "$HOME/.ssh"
echo "$key" > "$HOME/.ssh/id_rsa"
chmod 600 "$HOME/.ssh/id_rsa"

if [ "$inventory" ]; then
    echo "Writing inventory with custom content:"
    echo -e "$inventory" | tee "$default_inventory"
    options="${options} --inventory ${default_inventory}"
fi

if [ "$vault_password" ]; then
    echo "Setting vault password"
    echo "$vault_password" > "$default_vault_file"
    options="${options} --vault-password-file ${default_vault_file}"
fi

echo "$options"
echo "$playbook"

export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_FORCE_COLOR=True

ansible-playbook $options $playbook
