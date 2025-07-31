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
root.geometry("400x400")
root.configure(bg="#2c3e50")

# Styling
label_style = {"font": ("Arial", 14), "bg": "#2c3e50", "fg": "#ecf0f1"}
button_style = {"font": ("Arial", 14), "bg": "#27ae60", "fg": "white", "width": 15, "height": 2}
entry_style = {"font": ("Arial", 14), "bg": "#ecf0f1", "fg": "#2c3e50", "justify": "center"}

# Create widgets
title_label = tk.Label(root, text="Basic Calculator", font=("Arial", 18, "bold"), bg="#2c3e50", fg="#f1c40f")
title_label.pack(pady=10)

entry_num1 = tk.Entry(root, **entry_style)
entry_num2 = tk.Entry(root, **entry_style)

operation_var = tk.StringVar()
operation_label = tk.Label(root, text="Select Operation:", **label_style)
operation_menu = tk.OptionMenu(root, operation_var, "Add", "Subtract", "Multiply", "Divide")
operation_menu.config(font=("Arial", 12), bg="#34495e", fg="white")

calculate_button = tk.Button(root, text="Calculate", command=calculate, **button_style)
result_label = tk.Label(root, text="Result: ", font=("Arial", 16, "bold"), bg="#2c3e50", fg="#e74c3c")

# Layout
entry_num1.pack(pady=10, ipadx=10, ipady=5)
entry_num2.pack(pady=10, ipadx=10, ipady=5)
operation_label.pack()
operation_menu.pack()
calculate_button.pack(pady=20)
result_label.pack(pady=10)

# Run application
root.mainloop()
