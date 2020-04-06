#!/bin/sh

set -e

inventory_file="hosts"
vault_password_file=".vault_password"

playbook="$INPUT_PLAYBOOK"
directory="$INPUT_DIRECTORY"
key="$INPUT_KEY"
inventory="$INPUT_INVENTORY"
vault_password="$INPUT_VAULT_PASSWORD"
options="$INPUT_OPTIONS"

if test -z "$playbook"; then
    echo "::error::You need to specify 'playbook' input (Ansible playbook filepath)"
    exit 1
fi

if test -z "$key"; then
    echo "::error::You need to specify 'key' input (SSH private key)"
    exit 1
fi

mkdir -p "$HOME/.ssh"
echo "$key" > "$HOME/.ssh/id_rsa"
chmod 600 "$HOME/.ssh/id_rsa"

if test -n "$directory"; then
    echo "==> Changing directory to: $directory"
    cd "$directory"
fi

if test -n "$options"; then
    options="$(echo "$options" | tr '\n' ' ' | xargs)"
fi

if test -n "$inventory"; then
    echo "==> Writing inventory with custom content:"
    echo -e "$inventory" | tee "$inventory_file"
    options="$options --inventory $inventory_file"
fi

if test -n "$vault_password"; then
    echo "==> Setting vault password"
    echo "$vault_password" > "$vault_password_file"
    options="$options --vault-password-file $vault_password_file"
fi

export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_FORCE_COLOR=True

echo "[command]ansible-playbook $options $playbook"

ansible-playbook $options $playbook
