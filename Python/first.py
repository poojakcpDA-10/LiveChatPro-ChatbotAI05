'''import keyword
print(keyword.kwlist)'''

'''name=input("Enter name: ")           // input() returns string datatype
print(type(name))
print(name)'''

'''a=int(input("Enter a: "))               // int is used, so result is additon, else concatenation of strings
b=int(input("Enter b: "))
print(a+b)
'''
'''
n1,n2,n3=input("Enter names: ").split(',')
print("Name 1: ",n1)
print("Name 2: ",n2)
print("Name 3: ",n3)
'''
'''
a=input("Enter value of a : ")
b=input("Enter value of b: ")
c=a+b
print("Total: "+c)  #concatenation

a=int(input("Enter value of a : ")) #typecasting
b=int(input("Enter value of b: "))
c=a+b
print("Total: ",c)
'''
'''
#String Functions
s="Padma chenna"
print(s.upper())
print(s.lower())
print(s.capitalize())
print(s.title())
print(s.count("a"))
print(s.find("e"))
print(s.find("a",1))
print(s.replace("a","m"))
#bool returns
print(s.isupper())
print(s.islower())
print(s.endswith("na"))
print(s.isalpha())
s="joes123"
print(s.isalnum())
print(s.isnumeric())
s="    erty       "
print(len(s))
print(len(s.strip()))
print(len(s.lstrip()))
print(len(s.rstrip()))
#split
s="I\nam\nManthra KC"
print(s)
print(s.splitlines())
s="Hello Computer ,You are really interesting"
print(s.split(' '))
#partition
s="12/03/2023"          #Separate date from month and year
print(s.partition('/'))
'''
'''
#String manipulation or slicing
s="Padmachenna"
print(s[:])
print(s[:7])
print(s[3:])
print(s[-1])
print(s[-2:-1])
print(s[2:8:2])
print(s[8:2:-2])
print(s[::-1])
'''
'''
#Arithmetic op
a,b=12,13
print(a+b)
print(a-b)
print(a*b)
print(a/b)
print(a**2)
print(a//b)
print(b%a)'''
'''
#Assignmetn op
a=34
print(a)
a+=a            #arithmetic assignments
print(a)
a-=a
print(a)
a*=a
print(a)
a=23
a//=a
print(a)

#comparison op
a=23;b=34
print(a>b)'''

#logical op
a,b=45,25
print(a>=41 and a<=45)
#bitwise
print(a&b)
print(b<<2)
print(~a)