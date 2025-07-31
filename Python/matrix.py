import math
n=int(input("Enter no. of rows for square matrix:"))
a=[]
b=[]
for i in range(n):
    print("Enter number for row: ",i)
    for j in range(n):
        b.append(int(input()))
        
    a.append(b[:])
    print(a)
    b.clear()
sum1=sum2=0
c=[]
for i in range(n):
    for j in range(n):
        if(i==j):
            c.append(a[i][j])


for k in range(n):
    sum1+=c[k]


m=[]
d=len(a)-1
for i in range(n):
    m.append(a[i][d])
    d-=1


for k in range(n):
    sum2 +=m[k]
print(sum2)
print(sum1)

print("The differnece is:",math.fabs(sum1-sum2))

