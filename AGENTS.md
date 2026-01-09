# Code Style
* Always use configured @ aliases when importing modules
* Never comment WHAT code does, only WHY if really necessary

# Testing
* Tests are stored in tests/ mirroring src/ folders.
* vitest and react-testing-library is used
* respect "globals: true" and do not import vitest vars when editing tests
* After any of your changes tests must pass
