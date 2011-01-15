$(function(){

    listedit = { model:{}, collection:{}, view:{}, controller:{} };

    listedit.model.ListItem = Backbone.Model.extend({
        defaults: {
            title: 'ListItem',
        }
    });
    
    // listedit.model.List = Backbone.Model.extend({
    // });
    
    listedit.collection.List = Backbone.Collection.extend({
        initialize: function(){
            // sort by the index value, which gets updated by the view
            this.comparator = function(item){
                return item.get('index');
            }
        }
    });
    
    listedit.view.ListItem = Backbone.View.extend({
        tagName: 'li',
        className: 'ui-state-default',
        
        initialize: function() {
        },

        render: function() {
            $(this.el).html( this.model.get('name') ).attr('id', this.model.get('id') );
            return this;
        }
    });
    
    listedit.view.List = Backbone.View.extend({
        tagName: 'ul',
        
        initialize: function() {
            var self = this;
            _.bindAll(this, 'render', 'addOne');
            // listen to the sortable list being rearranged, so that we can
            // initiate the collection update
            $(this.el).sortable().bind('sortupdate', function(event,ui){
                self.updateCollectionOrder();
            });
            this.collection.bind('add', this.addOne );
            this.collection.bind('refresh', this.render );
        },

        render: function() {
            // clear out existing list items
            $(this.el).empty();
            // re-add list items from the collection
            this.collection.each( this.addOne );
            // make sure the collection reflects the displayed order 
            this.updateCollectionOrder();
            return this;
        },
        
        addOne: function(item) {
            var view = new listedit.view.ListItem({model:item});
            $(this.el).append(view.render().el);
        },
        
        updateCollectionOrder: function(){
            var order = $(this.el).sortable('toArray');
            for( i in order ){
                this.collection.get(order[i]).set({index:i});
            }
            this.collection.sort({silent:true});
            this.trigger('sortupdate', this.collection);
        },
    });
    
    listedit.App = Backbone.Controller.extend({
        
        initialize : function() {
            this.el = $('.list_container')[0];
            this.createDefaultModels();
            this.createSubViews();
            this.renderSubViews();
        },
        
        createDefaultModels : function() {
            // this.listModel = new listedit.model.List();
            this.collection = new listedit.collection.List();
        },
        
        createSubViews : function() {
            var self = this;
            
            this.view = new listedit.view.List({
                el:$('#mylist')[0],
                collection:this.collection,
            });
        },
        
        
        renderSubViews: function(){
            this.view.render();
        },

        refresh: function( data ) {
            // make sure all incoming items have an index
            _.each( data, function(item,index){
                if( !item.index )
                    item.index = index;
            });
            this.collection.refresh( data );
        },
    });
});
