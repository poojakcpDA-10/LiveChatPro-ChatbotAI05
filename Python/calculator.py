a=int(input("Enter 1st numbers:"))
c=int(input("Enter 2nd numbers:"))
b =input("Enter an operator:")
if(b=='+'):
    print(a+c)
elif(b=='-'):
    print(a-c)
elif(b=='*'):
    print(a*c)
elif(b=='/'):
    if(c!=0):
        print(a/c)
    else:
        print("Division by zero is not possible")

else:
    print("Enter operators:+,-,*,/")
