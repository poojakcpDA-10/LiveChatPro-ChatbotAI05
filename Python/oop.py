'''class os():
	pass

windows = os()

a=9
print(type(a))
print(type(os))
print(type(windows))

print(isinstance(windows,os))
print(isinstance(a,int))
'''

#class attributes
'''
class Student():
    name="Ram Kumar"
    age=24
 
#getattr
print(getattr(Student,'name'))
print(getattr(Student,'age'))
print(getattr(Student,"gender","No such directory exists"))
#print(getattr(Student,'gender'))
#dot notation
print(Student.name)
print(Student.age)
#setattr
setattr(Student,'name','Eeshwara')
print(getattr(Student,'name'))
setattr(Student,'gender',"Male")
print(Student.gender)
#Dot notation
Student.city="Krishnagiri"
Student.age=27
print(Student.city)
print(getattr(Student,'age'))

print(Student.__dict__)
delattr(Student,'age')
print(Student.__dict__)
del Student.city
print(Student.__dict__)
'''

#instance attributes
'''
class user:
    course = "Java"
print(user.__dict__)
print(user.course)
o = user()
print(o.__dict__)
print(o.course)
o.course = "c++"
print(o.__dict__)
print(o.course)

o2 = user()
print(o2.__dict__)
print(o2.course)
o2.course = "Python"
print(o2.__dict__)
print(o2.course)
'''

#class methods
'''
class Student:
    name = "Ram kumar"
    age = 34
    
    def printall():
        print("Name: ",Student.name)
        print("Age: ",Student.age)
        
Student.printall()

print(Student.__dict__)

print(getattr(Student,'printall'))
getattr(Student,'printall')()


print(Student.__dict__['printall'])
Student.__dict__['printall']()
'''

#instance methods
'''
class Student:
    name = 'ram kumar'
    age = 23
    
    def printall(self,gender):
        print("Name: ",Student.name)
        print("Age: ",Student.age)
        print("Gender: ",gender)
        
o = Student()
print(o.__dict__)
o.printall(34)

Student.printall(o,34)
'''

#constructor
'''
class Student:
    def __init__(self):             #instance method
        print("Created when called")
o = Student()
o2 = Student()
'''
'''
class Student:
    def __init__(self,name):             #instance method
        print("Created when called")
        self.name = name
    def printall(self):
        print("Name: ",self.name)
o = Student("Anu")
o.printall()
o2 = Student("anu")
o2.printall()
print(o.__dict__)
print(o2.__dict__)
'''
'''
class Student:
    def __init__(self,name,age):
        self.name = name
        self.age = age
        self.msg = self.name + " is "+str(age)+" years old"
o1 = Student("Harris",34)
print(o1.name)
print(o1.age)
print(o1.msg)
o1.age = 67
print(o1.age)
print(o1.msg)
'''

'''
class Student:
    def __init__(self,name,age):
        self.name = name
        self.age = age
    @property   
    def msg(self):
        return self.name + " is "+str(self.age)+" years old"
o1 = Student("Harris",34)
print(o1.name)
print(o1.age)
print(o1.msg)
o1.age=67
print(o1.age)
print(o1.msg)
'''

#property getter & setter
'''
class Student:
    def __init__(self,total):
        self._total= total
    def average(self):
        return self._total/5
    @property
    def total(self):
        return self._total
    @total.setter
    def total(self,t):
        if t>100 & t<500:
            print("Number is between 100 & 500")
        else:
            self._total = t
        
o1 = Student(200)
print("Total: ",o1.total)
print("Average: ",o1.average())
o1.total=300
print("Total: ",o1.total)
print("Average: ",o1.average())
'''
#property method

class Student:
    def __init__(self,total):
        self._total= total
    def average(self):
        return self._total/5
    
    def getter(self):
        return self._total
    
    def setter(self,t):
        if t>100 & t<500:
            print("Number is between 100 & 500")
        else:
            self._total = t
    total = property(getter, setter)    
o1 = Student(200)
print("Total: ",o1.total)
print("Average: ",o1.average())
o1.total=300
print("Total: ",o1.total)
print("Average: ",o1.average())


