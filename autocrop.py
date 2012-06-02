from PIL import Image
import StringIO

def autocrop_image(raw):
    thephoto=Image.open(StringIO.StringIO(raw))
    
    pdata=thephoto.load()
    size=thephoto.size
    threshold=240
    
    def is_ok(var):
        if(var[0]<threshold):
            return False
        if(var[1]<threshold):
            return False
        if(var[2]<threshold):
            return False
        return True
    
    #find topright
    def find_top():
        for y in xrange(size[1]):
            for x in xrange(size[0]) :
                val=pdata[x,y]
                if(not is_ok(val)):
                    return y
                
    def find_bottom():
        for y in reversed(xrange(size[1])):
            for x in xrange(size[0]) :
                val=pdata[x,y]
                if(not is_ok(val)):
                    return y
    
    def find_left():
        for x in xrange(size[0]):
            for y in xrange(size[1]):
                val=pdata[x,y]
                if(not is_ok(val)):
                    return x
    
    def find_right():
        for x in reversed(xrange(size[0])):
            for y in xrange(size[1]):
                val=pdata[x,y]
                if(not is_ok(val)):
                    return x
                
    
    top=find_top()
    bottom=find_bottom()
    left=find_left()
    right=find_right()
    
    thephoto=thephoto.crop((left,top,right,bottom))
    
    output=StringIO.StringIO()
    thephoto.save(output,"png")
    thephoto=output.getvalue()
    return thephoto

def test():
    theraw=open("test.jpg").read()
    result=autocrop_image(theraw)
    savefile=open("result.png","w")
    savefile.write(result)
    savefile.close()
    print("ok")