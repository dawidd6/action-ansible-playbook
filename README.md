# Run Ansible playbook Github Action

An action that executes given Ansible playbook on selected hosts.

Should work on any OS, if `ansible-playbook` command is available in `PATH`.

## Usage

```yaml
- name: Run playbook
  uses: dawidd6/action-ansible-playbook@v2
  with:
    # Required, playbook filepath
    playbook: deploy.yml
    # Optional, directory where playbooks live
    directory: ./
    # Optional, SSH private key
    key: ${{secrets.SSH_PRIVATE_KEY}}
    # Optional, literal inventory file contents
    inventory: |
      [all]
      example.com

      [group1]
      example.com
    # Optional, encrypted vault password
    vault_password: ${{secrets.VAULT_PASSWORD}}
    # Optional, galaxy requirements filepath
    requirements: galaxy-requirements.yml
    # Optional, additional flags to pass to ansible-playbook
    options: |
      --inventory .hosts
      --limit group1
      --extra-vars hello=there
      --verbose
```
