import tkinter as tk
from tkinter import messagebox

def calculate():
    try:
        num1 = float(entry_num1.get())
        num2 = float(entry_num2.get())
        operation = operation_var.get()
        
        if operation == "+":
            result = num1 + num2
        elif operation == "-":
            result = num1 - num2
        elif operation == "*":
            result = num1 * num2
        elif operation == "/":
            if num2 == 0:
                messagebox.showerror("Error", "Cannot divide by zero")
                return
            result = num1 / num2
        else:
            messagebox.showerror("Error", "Please select an operation")
            return
        
        result_label.config(text=f"{num1} {operation} {num2} = {round(result, 2)}")

    except ValueError:
        messagebox.showerror("Error", "Please enter valid numbers")

# Create main window
root = tk.Tk()
root.title("Basic Calculator")
root.geometry("400x450")
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
operation_frame = tk.Frame(root, bg="#2c3e50")
operations = ["+", "-", "*", "/"]
for op in operations:
    btn = tk.Button(operation_frame, text=op, font=("Arial", 14), bg="#34495e", fg="white", width=5, height=2, command=lambda o=op: operation_var.set(o))
    btn.pack(side=tk.LEFT, padx=5)

calculate_button = tk.Button(root, text="Calculate", command=calculate, **button_style)
result_label = tk.Label(root, text="Result: ", font=("Arial", 16, "bold"), bg="#2c3e50", fg="#e74c3c")

# Layout
entry_num1.pack(pady=10, ipadx=10, ipady=5)
entry_num2.pack(pady=10, ipadx=10, ipady=5)
operation_frame.pack(pady=10)
calculate_button.pack(pady=20)
result_label.pack(pady=10)

# Run application
root.mainloop()
