
#if stat
'''
a=int(input("Enter a number: "))
if a%2==0:
    print(a," is even ")
  '''
#vote eligibility (if else)
'''
a=input("Enter your name: ")
b=int(input("Enter age: "))
if b>=18:
        print(a," age is ",b," eligible to vote")
else:
    print(a," age is ",b," not eligible ot vote")
'''
#elif
'''
a=int(input("Enter days: "))
if a==0:
    print("No fine")
elif a>=1 and a<=5:
    print("your fine is: ",a*0.5)
elif a>5 and a<=10:
    print("Your fine is: ",a*1)
elif a>10 and a<=30:
    print("Your fine is: ",a*5)
else:
    print("Membership cancel")
    '''
#nested if
'''
m1=int(input("Enter sub1 mark: "))
m2=int(input("Enter sub2 mark: "))
m3=int(input("Enter sub3 mark: "))
total=(m1 +m2 + m3)
avg=total/3
if m1>=35 and m2>=35 and m3>=35:
    if avg>=91 and avg<=100:
        print("Your grade is : A")
    elif avg>=81 and avg<=90:
        print("Your grade is : B")
    elif avg>=71 and avg<=80:
        print("Your grade is : C")
    elif avg>=61:
        print("Your grade is : D")
    #print("Pass")
else:
    print("Fail")
    '''
#while
'''
i=1
while(i<=10):
     print(i, end="\t")
     i+=1
print("")
i=2
while (i<=20):              #Even
    print(i,end="\t")
    i+=2
print("")
i=1
while (i<=10):              #Odd
    print(i,end="\t")
    i+=2
    '''
#continue and break
'''
i=1
while i<=10:
    if i==6:
        i+=1
        continue
    print(i,end="\t")
    i+=1
print('')
i=1
while i<=10:
    if i==6:
        break
    print(i,end="\t")
    i+=1
'''
#range
'''
print(list(range(6)))
print(list(range(2,6,2)))
print(list(range(10,2,-2)))
'''
#triangle
'''
for i in range(6):
    for j in range(i):
        print("*",end='')
    print('')    

for i in range(5,0,-1):
    for j in range(i):
        print("*",end='')
    print('')     
for i in range(65,70,1):
    for j in range(65,70,1):
        print(chr(j),end='')
    print('')
    '''
#list
'''
a = [1,"Ram",3.45,True]

print(a)
print(a[1])
print(type(a))
print(type(a[0]))
print(type(a[3]))
print(type(a[2]))
a[2]=0.23
print(a)'

print(a[:])
print(a[1:])
print(a[:2])
print(a[:-1:-1])
print(a[0]," type is ",type(a[0]))
'''
#Nested list
'''
a = [1,"Ram",2.3,True,[1,2.3,"jo",78]]
print(a[4][1])
a[4][3]="jai"
print(a)
b=a.copy()
print(a)
a.clear()
print(a)
print(b.count(2.3))
print(b.index([1,2.3,"jo","jai"]))
print(len(b))
b.pop(3)
print(b)
b.remove("Ram")
print(b)

#built in funcs
a=["sam","say","kai"]
a.append("Dad")
a.append("papa")
print(a)
b=[1,2,3,4,5]
a.extend(b)
print(a)
a.insert(3,2.2)
print(a)
print(list("Tutoe joes"))
a=["samp","saytyf","kai"]
a.sort()
print(a)
a.sort(reverse = True)
print(a)
a.sort(key = len)
print(a)
'''
#Tuples
'''
a=(1,2,3.4,"riya",True)
print(type(a))
print(type(a[3]))
print(a[:])
print(a[1:5:2])
b=list(a)
b.insert(4,"hi")
b.append("KO")
a=tuple(b)
print(a)

a=(1)
print(type(a))
a=(1,)
print(type(a))
if "riya" in a:
    print("goood job manthra")
print(len(a))
#del a
#print(a)
a=(1,2,3,4,5,7,7,6); b=(7,8,9,10,11)
c=a+b
print(c)
print(max(c))
print(min(c))
print(c.count(7))
#nested tuple
c=(a,b)
print(c)
n=("riu",)*3
print(n)
print(max(c))'''
#set
'''
a={1,2,3.4,"riya",True,1,9.8}
print(type(a))
print(a)
a.add("sani")
print(a)
b=set()
b.update(a)
print(b)
b.remove(3.4)
print(b)
b.discard("ho")
print(b)
b.pop()
print(b)
b.clear()
print(b)
del a
print(a)
'''
#built in funcs
'''
a={1,2,3,4,5,7,7,6}; b={7,8,9,10,11}
c=a.union(b)
#print(c)
a.update(b)
print(a)
c=a.intersection(b)
#print(c)
a.intersection_update(b)
print(a)
c=a.symmetric_difference(b)
print(c)
a.symmetric_difference_update(b)
print(a)
c=a.isdisjoint(b)
print(c)
c=a.issubset(b)
print(c)
c=a.issuperset(b)
print(c)
'''
#dict
'''
d={"name":"Manthra" ,"dept" : "CSE", "reg" : 306,"dob": "26-05-2005","cgpa" :8.37}
print(d["reg"])
print(d.get("cgpa"))
print(d.keys())
print(d.values())
print(d.items())
for x in d:                         #doubt
    #print(x)
    print(d[x])
    
for x in d.keys():
    print(x)
    
for x in d.values():
    print(x)

for x,y in d.items():
    print(x,y)
    
if "dept" in d:
    print("hello")
    
d.update({"gen":'F'})
print(d)
d["gen"]='M'
print(d)
d.pop("gen")
print(d)
d.clear()
print(d)
#del d
#print(d)
d={"name":"Manthra" ,"dept" : "CSE", 'k':{"reg" : 306,"dob": "26-05-2005","cgpa" :8.37}}
print(d['k']['reg'])
'''
#identity
'''
a=[1,2] ; b=[1,2]
c=a
print(id(a))
print(id(b))
print(id(c))
print(a is b)
print(a is c)
print(a==b)
print(a==c)
print(a is not b)
print(a!=b)
'''
#membership

a=[10,20,30,40,50,{'k':{'o':"hi",'n':4.5}}]
print(a[5] in a)
print(20 not in a)
print(24 not in a)
print(a[5]['k']['n'])