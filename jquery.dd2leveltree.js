/**
 * Drag-Drop 2 Level Tree jquery plugin
 * 
 * This is a project with code almost entirely from
 *  http://www.prodevtips.com/demos/drag_drop_tree/
 * yet modified to only allow 2 levels max, and also in a plugin form
 * @requires jqueryui, jeditable for renaming
 */
(function ($) {
    var cache = {};
    var z = 100; //make z index start at 100 and increase during each drag drop operation
    jQuery.fn.dd2leveltree = function(opts){ 
        function init($trees, opts){
            $trees.each(function(){ 
                     var $this = $(this);
                     if (!$this.is('ul') || !$this.attr('id')){ 
                           alert('d2lt is only available on a ul with an id');    
                           return true; 
                     }
                     
                     $this.addClass('d2lt');
                
                     if (!cache[$this.attr('id')]){
                         cache[$this.attr('id')] = {opts: false};
                     }
                     if (typeof(cache[$this.attr('id')]['opts']) == 'object'){
                             opts = cache[$this.attr('id')]['opts'];
                     }else{
                          //store options for this tree
                          cache[$this.attr('id')]['opts'] = opts;
                     }

                      
                       
                       if (opts.EVERY_LI_IS_ITEM){
                           $('li', $this)
                              .removeClass('d2lt_draggable')
                              .removeClass('d2lt_droppable')
                              .removeClass('d2lt_level2')
                              .removeClass('d2lt_level1')
                              .removeClass('d2lt_level0')
                              .each(function(){ 
                                  $.removeData(this, 'd2lt_item_level');
                               })
                              .addClass('d2lt_item')
                              .data('d2lt_item','item');
                           $('li span', $this).addClass('d2lt_span');
                       }
                       //-------------------------------------------
                       //.,-+/ Assign levels to existing nodes \+-,.
                       //-------------------------------------------
                       $('li:first', $this)
                                 .data('d2lt_item','root')
                                 .data('d2lt_item_level', 0)
                                 .addClass('d2lt_level0')
                                 .addClass('d2lt_droppable');
                       
                       $this.find('> li.d2lt_item > ul > li.d2lt_item')
                            .data('d2lt_item_level', 1)
                            .addClass('d2lt_level1'); 
                       
                       $this.find('> li.d2lt_item > ul > li.d2lt_item > ul > li.d2lt_item')
                            .data('d2lt_item_level', 2)
                            .addClass('d2lt_level2');
                       
                       //ALL LEVEL 2 LEAFs ARE DRAGGABLE but NOT DROPPABLE
                       $('li.d2lt_item.d2lt_level2', $this)
                            .addClass('d2lt_draggable')
                            .removeClass('d2lt_droppable');
                       
                       
                       //ALL LEVEL 1 LEAFs are DROPPABLE but only DRAGGABLE with 0 children
                       $this.find('li.d2lt_item.d2lt_level1')
                              .addClass('d2lt_droppable')
                              .each(function(){
                                var $li = $(this);
                                  var children = $li.find('> ul > li');
                                  if (children.size() == 0){
                                      $li.addClass('d2lt_draggable');
                                  }else{
                                      $li.removeClass('d2lt_draggable');
                                  }
                              });
                       
                   });            
        }
        if (opts === 'init'){ init($(this), cache[$(this).attr('id')]['opts']); return $(this); }
        if (opts === 'completeDragDrop'){ cache[$(this).attr('id')]['fnCompleteDragDrop'](); return $(this); }
        if (opts === 'completeDelete'){  cache[$(this).attr('id')]['fnCompleteDelete']();
        
        
        if (!opts){ opts = {} }
        // Create some defaults, extending them with any options that were provided
        opts = $.extend( {
            'EVERY_LI_IS_ITEM': true, //should be true unless self-specifying all d2lt classes
            'z-start': false, //can start z value as high as you want, will start at 101 automatically
            'DELETE_DROP_ZONE': false, //can the user drop to a delete target?
            'onDragDrop': null, //intercept when dragging and dropping onto another node
            'onDeleteZoneDrop': null //intercept when dropping onto a delete drop zone
        }, opts);
        
        if (opts['z-start']){ z = opts['z-start']; }
        
        
        
        function init_dragdrop($trees){
            $trees.each(function(){
                var $this = $(this);
                
                if (!$this.is('ul') || !$this.attr('id') || !cache[$this.attr('id')]){ 
                           //alert('d2lt is only available on a ul with an id');    
                           //and init must have already been called
                           return true; 
                } 
                var opts = cache[$this.attr('id')]['opts'];
                                
                var onDragDrop = function(event, ui){
                    var liDropped = ui.draggable;
                    liDropped.css({top: 0, left: 0});
        
                    var spnDropped = $('span:first-child', liDropped);
                     //                      <li>    <ul>     <li>
                     var liParentDropped = liDropped.parent().parent();
                     var liOldParent = liParentDropped;
                     
                     var spnParentDropped = false;
                     var parentIsRoot = true;
                     if (liParentDropped.length > 0){
                        if (liParentDropped[0].tagName == 'LI'){
                           spnParentDropped = $('span:first-child', liParentDropped);
                           parentIsRoot = false;
                        }
                     } 
                     
                     var me = $(this).parent();
                     var liNewParent = me;
                     var spnNewParent = $(this);
                     
                     var newParent = me;
            
                     if (liOldParent.get(0) == liNewParent.get(0)){
                        //console.log('old parent is same as new, do nothing');
                        return;
                     }
                     
                     //console.log('Dropping "' +  spnDropped.html() + '"(' + liDropped.attr('id') +') onto "' + spnNewParent.html() + '"(' + liNewParent.attr('id') +')'); 
                     
                     if (!liNewParent.hasClass('d2lt_droppable')){
                        //console.log('cannot drop on this parent');
                        return;
                     }
                     
                    //the below should never get called because it is stopped in the onDrag function
                    //but we'll go ahead and check just in case
                     if (!liDropped.hasClass('d2lt_draggable')){
                         //console.log('this is not not draggable');
                         return; //don't let it drag if not draggable
                     }
                     
                     var oldParent = liDropped.parent();
                     if (liParentDropped == liNewParent){
                        return; //new parent is same as old parent, do nothing
                     }
               
                     var dragsubbranches = liDropped.children("ul");
                     if (dragsubbranches.size() > 0){
                        //console.log('Cannot have nested subgroups. First move subgroups');
                        return; //cannot bring any children with you
                     }
        
                    var complete_drag = true;
                    if (typeof(opts.onDragDrop) == 'function'){
                        complete_drag = opts.onDragDrop(liDropped, liNewParent);
                    }
                    
                    fnCompleteDragDrop = function(){
                              var subbranch = $(me).children("ul");
                              if(subbranch.size() == 0) {
                                 me.find("span").after("<ul></ul>");
                                 subbranch = me.find("ul");
                              }
                              
                              subbranch.eq(0).prepend(liDropped);
                              var oldBranches = $("li", oldParent);
                              
                              if (oldBranches.size() == 0) { 
                                 $(oldParent).remove(); 
                              }else if (oldBranches.size() == 1){
                                 //if 1 branch, and we are removing it....
                                 //console.log('enable draggable');
                                 $(oldParent)//.draggable(drag_config)
                                             //.draggable( "option", "disabled", false )
                                             .addClass('d2lt_draggable');
                              }
                              
                              
                              if (newParent.data('d2lt_item') != 'root'){
                                  //parent group is not root, therefore we make it not draggable
                                  newParent.removeClass('d2lt_draggable');
                                 
                                 //droppability must be removed in the li > span
                                 liDropped.removeClass('d2lt_droppable');    
                                  $('span:first-child', liDropped).removeClass('d2lt_droppable');
                              }else{
                                 //moved to Root, thus converted to normal (non-sub) group
                                 liDropped.addClass('d2lt_droppable');
                                 $('span:first-child', liDropped).addClass('d2lt_droppable');   
                              }
                              
                              
                              var child_lis = liOldParent.find('li');
            
                              //if the old parent has no more children, make it draggable
                              if (child_lis.size() == 0){
                                  liOldParent.addClass('draggable');
                              }
                        };//fnCompleteDrag

                    if (complete_drag){ 
                         fnCompleteDragDrop();                 
                     }else{
                        //else user will complete this later on his own
                     }
                     //store this in cache so user can later on complete the drag
                     cache[$this.attr('id')]['fnCompleteDragDrop'] = fnCompleteDragDrop;
                    
                }; //end onDrop function
           
                var drop_config = {
                  tolerance  	: "pointer",
                  hoverClass		: "d2lt_hover",
                  drop			: onDragDrop
                };
                
                //make all tree items droppable (not really though see d2lt_draggable and d2lt_droppable
                $("li.d2lt_item span", $this).droppable(drop_config);        
                        
                
                
                var drag_config = {
                     opacity: 0.5,
                     revert: true,
                     start: function(event, ui) {
                        //console.log(ui.helper);
                        if (!ui.helper.hasClass('d2lt_draggable')){
                           ui.helper.css('opacity', 1);
                           event.preventDefault();
                           return false;
                        }            
                        $(this).css("z-index", z++); 
                     }
                }
                
                $("li.d2lt_item", $this).draggable(drag_config);
               
                //drag and droppability is complete               
            });
        }
        
        function init_deletezone($trees, $deletezone){
            $trees.each(function(){
                var $this = $(this);
                
                if (!$this.is('ul') || !$this.attr('id') || !cache[$this.attr('id')]){ 
                           return true; 
                } 
                var opts = cache[$this.attr('id')]['opts'];
                
                $deletezone.droppable({
                     tolerance    	: "pointer",
                     hoverClass		: "d2lt_hover",
                     drop			: function(event, ui){
                     		  var dropped = ui.draggable;
                              dropped.css({top: 0, left: 0});
                              
                              
                              var liDropped = dropped;
                              var spnDropped = $('span:first-child', liDropped);
                              //                      <li>    <ul>     <li>
                              var liParentDropped = liDropped.parent().parent();
                              var liOldParent = liParentDropped;
                              
                              var oldParent = dropped.parent();
                              
                              var fnDeleteDraggedNode = function (){
                                       
                                             var oldBranches = $("li", oldParent);
                                             
                                             if (oldBranches.size() == 0) { 
                                                $(oldParent).remove(); 
                                             }else if (oldBranches.size() == 1){
                                                //if 1 branch, and we are removing it....
                                                //console.log('enable draggable');
                                                $(oldParent).addClass('d2lt_draggable');
                                             }
                                             
                                             liDropped.remove();
                                             
                                             var child_lis = liOldParent.find('li');
            
                                             //if the old parent has no more children, make it draggable
                                             if (child_lis.size() == 0){
                                                 liOldParent.addClass('d2lt_draggable');
                                             }
                              }
                              var delete_now = true;
                              if (typeof(opts.onDeleteZoneDrop) == 'function'){
                                  delete_now = opts.onDeleteZoneDrop(liDropped, $(this));
                              }
                              if (delete_now){
                                  fnDeleteDraggedNode();    
                              }else{
                                  cache[$this.attr('id')]['fnCompleteDelete'] = fnDeleteDraggedNode();
                              }
                     }
            	   });
            }//end foreach tree
        }//end init delete zone
        
        var $this = $(this);
        
        init($this, opts);
        init_dragdrop($this);
        
        if (opts.DELETE_DROP_ZONE){
           init_deletezone(opts.DELETE_DROP_ZONE);
        }
        
        return $(this);
    }
})(jQuery);
