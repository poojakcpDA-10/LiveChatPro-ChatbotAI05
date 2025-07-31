#Functions
'''
def wel():
	print("Welcome")
wel()
wel()
'''
#no return type wihtout argument function
'''
def add1():
    a=int(input("enter no.: "))
    b=int(input("enter no.: "))
    print(a+b)
add1()

#no return type with argument function
def sub1(a,b):
    print(a-b)
sub1(45,21)

 #with return type without argument function
def sub1():
    a=int(input("enter no.: "))
    b=int(input("enter no.: "))
    return a-b
o=sub1()    
print(o)

#with return type with argument function
def sub1(a,b):
    return a-b
o=sub1(56,43)    
print(o)
'''
#Arbitrary arguments functions
'''
def k(*man):
    print(man)
    for i in man:
        print(i)
   
k(21,34,7.6,-0.9,"hi")

#keyword argument function
def msg(name,age):
    print(name," age is ",age)
msg(age=34,name="laks")
msg(34,"laks")

#arbitrary keyword funcs
def biodata(**data):
    print(data)
biodata(name="sani",age=19,gpa=7.8)

#default parameter
def msg(name,age,city="salem"):
    print(name," age is ",age," city is ",city )
msg(age=34,name="laks")
msg(34,"laks") 
msg(age=34,name="laks",city="krishnagiri") 

#passing list as argument
def total(marks):
    return sum(marks)
p=total([21,34,5,6,76])
print(p)
#recursive funcction
def facto(n):
    if n==1 or n==0:
        return 1
    else:
        return n*facto(n-1)
m=facto(5)   
print(m)

#lambda
c=lambda a,b:a*b
print(c(4,5))
c=lambda a:a+9
print(c(4))
c=lambda a,b:a-b
print(c(4,1))
'''
#datatime package
import datetime as dt
'''
#current date

cu=dt.date.today()
print(cu)
#current date & time
c=dt.datetime.now()
print(c)
#useer defined date
p=dt.date(2023,5,26)
print(p)
print(p.year)
print(p.month)
print(p.day)
#user defined time
a=dt.time(10,20,36,4567)
print(a)
print(a.hour)
print(a.minute)
print(a.second)
print(a.microsecond)
#user defined time and date 
new=dt.datetime(2022,3,21,12,45,23,234567)
print(new)
print(new.date())
print(new.time())
'''
#New year
'''
c=dt.datetime.now()
newy=dt.datetime(2025,1,1)
diff= newy-c
print(diff)

c=dt.datetime.now()
s=c.strftime("%A %b %d %Y")
print(s)

#try except
try:
    a=5/0
except Exception as e:
    print(e)
#try except else
try:
    #a=int(input("Enter a number: "))
    a=24/0
except Exception as e:
    print(e)
else:
    print(a)
#try except else finally 
try:
    a=int(input("Enter a number: "))
    a=24/a
except Exception as e:
    print(e)
else:
    print(a)
finally:
    print("Helloo")
'''
#Exceptions
'''
print(dir(locals()['__builtins__']))
print(len(dir(locals()['__builtins__'])))
'''
#Name error
'''
try:
    print(a)
except NameError as e:
    print(NameError)
    print(" a is not defined")
    print(e)
'''
#Value error
'''
try:
    a=int("joe")
    print(a)
except ValueError as e:
    print(ValueError)
    print(" enter numbers only")
    print(e)
'''
#Indexerror
'''
try:
    a=[1,2,3,4,5,6]
    print(a[10])
except IndexError as e:
    print(IndexError)
    print(" No such index")
    print(e)
'''
#Filenotfounderror & multiple exceptions
try:
    a=open("hello.py")
    w=10/0
    print(w)
    print(10)
except FileNotFoundError as e:
    print(FileNotFoundError)
    print(" File not exists")
    print(e)
except ZeroDivisionError:
    print("Division by zero is not defined")
else:
    print(a.read())