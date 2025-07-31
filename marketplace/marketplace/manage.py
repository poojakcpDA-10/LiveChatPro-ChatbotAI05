#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
'''import os
import sys
sys.setrecursionlimit(1500)
from django.core.management import execute_from_command_line

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'marketplace.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()'''


'''import sys
sys.setrecursionlimit(5)  # Set the recursion limit

# Other imports
import os
from django.core.management import execute_from_command_line

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "marketplace.settings")
    execute_from_command_line(sys.argv)
'''

#!/usr/bin/env python
import os
import sys
sys.setrecursionlimit(1000)

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "marketplace.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and available on your PYTHONPATH environment variable?"
        ) from exc
    execute_from_command_line(sys.argv)
