# Stress Test Readme
## Requirements

> [!INFO] Info
> Needs Python3 to be installed.

## Running the script to create files for stress-testing
To populate this directory with a large number of files for testing, run:

```bash
cd obsidian-tasks
./scripts/stress_test_obsidian_tasks.py
```

The script will write output files to this directory.
There are some parameters in the script that you can edit.

The created files are ignored in the `.gitignore`

## Varying behaviour

There are some hard-coded constants in `scripts/stress_test_obsidian_tasks.py` that you can edit to vary the behaviour.
