jquery-dd2leveltree
===================

See the latest code in action here with a pretty treeview:
http://jsfiddle.net/relipse/94PYZ/

Drag-Drop 2-Level Tree

Go ahead and create some html:
```
<ul id="tree"><li><span>Root</span>
<ul>
   <li><span>Things you should NOT throw</span></li>
   <li><span>Things you can throw</span></li>
   <li><span>Tools</span>
   <ul>
       <li><span>Wrenches</span></li>
       <li><span>Hammers</span></li>
       <li><span>Screwdriver</span></li>
   <ul></li>
</ul>
</li>
</ul>
```

now add the 2 level drag drop tree code
(requires jqueryui)
```
// T E S T I N G
$('#tree').dd2leveltree({onDrop: function(){
    setTimeout(function(){
        $('#tree').draggable2LevelTree('completeDrag');
    }, 1000);
     return false; //do not complete drag (until timeout above)
}});

```
