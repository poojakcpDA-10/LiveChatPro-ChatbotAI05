#Reading
'''
try:
	file = open("hello.txt","r")
	print(file.read())
except FileNotFoundError:
	print("No such file exists")
else:
	file.close()
'''	
'''
try:
    file = open("hello.txt","r")
    print(file.readline(9));print(file.readline());print(file.readline())
    print(file.readline())
    print(file.readline())
    #print(file.readlines())
    for line in file:
        print(line)
except FileNotFoundError:
    print("No such file exists")
else:
	file.close()
'''

#Writing
'''
try:
    file = open("hello.txt","w")
    file.write("This is manthra from krishnagiri \n studying in gct\n III-Cse")
    
except FileNotFoundError:
    print(FileNotFoundError)
else:
    file.close()
'''
    
#Appending
'''
try:
    file = open("hello.txt","a")
    file.write("Hiii")
    
except FileNotFoundError:
    print(FileNotFoundError)
else:
    file.close()
'''
#Deleting
'''
import os 
if os.path.exists("test.txt"):
    os.remove("test.txt")
else:
    print("file not found error")
'''

