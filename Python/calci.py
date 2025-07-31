import tkinter as tk
from tkinter import messagebox

def calculate():
    try:
        num1 = float(entry_num1.get())
        num2 = float(entry_num2.get())
        operation = operation_var.get()
        
        if operation == "Add":
            result = num1 + num2
        elif operation == "Subtract":
            result = num1 - num2
        elif operation == "Multiply":
            result = num1 * num2
        elif operation == "Divide":
            if num2 == 0:
                messagebox.showerror("Error", "Cannot divide by zero")
                return
            result = num1 / num2
        else:
            messagebox.showerror("Error", "Please select an operation")
            return
        
        result_label.config(text=f"Result: {result}")
    except ValueError:
        messagebox.showerror("Error", "Please enter valid numbers")

# Create main window
root = tk.Tk()
root.title("Basic Calculator")
root.geometry("400x300")
root.configure(bg="#f0f0f0")

# Create widgets
entry_num1 = tk.Entry(root, font=("Arial", 14))
entry_num2 = tk.Entry(root, font=("Arial", 14))
operation_var = tk.StringVar()

operation_label = tk.Label(root, text="Select Operation:", font=("Arial", 12), bg="#f0f0f0")
operation_menu = tk.OptionMenu(root, operation_var, "Add", "Subtract", "Multiply", "Divide")
operation_menu.config(font=("Arial", 12))

calculate_button = tk.Button(root, text="Calculate", font=("Arial", 14), bg="#4CAF50", fg="white", command=calculate)
result_label = tk.Label(root, text="Result: ", font=("Arial", 14), bg="#f0f0f0")

# Layout
entry_num1.pack(pady=10)
entry_num2.pack(pady=10)
operation_label.pack()
operation_menu.pack()
calculate_button.pack(pady=10)
result_label.pack(pady=10)

# Run application
root.mainloop()
