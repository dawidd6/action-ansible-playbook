#!/bin/bash

set -e

playbook="$INPUT_PLAYBOOK"
key="$INPUT_KEY"
options="$INPUT_OPTIONS"

if test -z "$playbook"; then
    echo "You need to specify 'playbook' input (Ansible playbook filepath)"
    exit 1
fi

if test -n "$key"; then
    mkdir -p ~/.ssh
    echo "$key" > ~/.ssh/id_rsa
    chmod 400 ~/.ssh/id_rsa
fi

export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_FORCE_COLOR=True

ansible-playbook "$options" "$playbook"