def main():
    s=input("Enter string: ")
    l=len(s);
    c=input("Enter char to sep: ")
    d=[]
    m=''
    for i in range(0,l,1):
        if(s[i]!=c):
            m += s[i]
        else:
            d.append(m)
            m=''
    if m:
        d.append(m)
    print(d)
main()
        
    
