# Run Ansible playbook Github Action

An action that executes given Ansible playbook on selected hosts.

## Usage

```yaml
- name: Run playbook
  uses: dawidd6/action-ansible-playbook@master
  with:
    playbook: deploy.yml
    directory: ./
    key: ${{secrets.SSH_PRIVATE_KEY}}
    options: |
      --inventory hosts
      --limit dev
      --extra-vars hello=there
      --verbose
```
