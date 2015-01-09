/**
 * The SidebarNavView view.
 */
define([
  'jquery',
  'backbone',
  'underscore',
  'mps'
], function($,Backbone, _,mps) {

  'use strict';

  var SidebarNavModel = Backbone.Model.extend({
    defaults: {
      offset: null,
      height: null
    }
  });


  var SidebarNavView = Backbone.View.extend({

    el: '#sidebarNavView',

    events: {
      'click .nav-item' : 'updateSource',
      'click .nav-title' : 'scrollTo',
      'click #back-btn' : 'returnBack',
      'click .source_header' : 'toggleSources',
      'click .source_dropdown_header' : 'toggleDropdown',
      'click .source_dropdown_menu a' : 'showSubContent'
    },

    initialize: function() {
      if (!this.$el.length) {
        return
      }
      //CACHE
      this.$window = $(window);
      this.$document = $(document);
      this.$htmlbody = $('html,body');
      this.$headerH1 = $('#headerView').find('h1');
      this.$backBtn = $('#back-btn');
      this.$navItem = this.$el.find('.nav-item');
      this.$sideBarAside = $('#sidebarAside');
      this.$sideBarBox = $('#sources-box');
      this.$sourceArticle = $('.source-article');
      this.$sourceHeader = $('.source_header');
      this.$sourceBody = $('.source_body');
      this.$cut = $('#cut');
      this.$sourceSpinner = $('#sources-spinner');

      //VARS
      this.padding = 40;
      this.first = true;
      this.mobile = (this.$window.width() > 850) ? false : true;


      //INIT
      this.setListeners();
    },

    setListeners: function(){
      this.calculateOffsets();
      this.scrollDocument();
      this.$document.on('scroll',_.bind(this.scrollDocument,this));
      this.$window.on('resize',_.bind(this.calculateOffsets,this));

      mps.subscribe('SourceStatic/change',_.bind(this.changeSource,this));
      mps.subscribe('SubItem/change',_.bind(this.calculateOffsets,this));
    },


    toggleDropdown: function(e){
      e && e.preventDefault();
      $(e.currentTarget).parents('.source_dropdown').find('.source_dropdown_menu').toggle(0);
    },

    showSubContent:function(e){
      e && e.preventDefault();
      $(e.currentTarget).parents('.source_dropdown').find('.source_dropdown_menu').hide(0);

      var text = $(e.currentTarget).text();
      var id = $(e.currentTarget).data('slug');
      $(e.currentTarget).parents('.source_dropdown').find('.source_dropdown_header').find('.overview_title').children('span').text(text);

      $('.source_dropdown_body').hide(0);
      $('#'+id).show(0);

      this.calculateOffsets();

    },


    toggleSources: function(e){
      var top;
      this.$sourceBody.hide(0);


      if ($(e.currentTarget).hasClass('active')) {
        this.$sourceBody.removeClass('active');
        $(e.currentTarget).removeClass('active');
      } else {
        this.$sourceHeader.removeClass('active');
        top = $(e.currentTarget).offset().top;
        $(e.currentTarget).addClass('active');
        $(e.currentTarget).parent().children('.source_body').show(0);
      }

      setTimeout(_.bind(function(){
        this.calculateOffsets(top);
      },this),50);
    },



    calculateOffsets: function(top){
      this.$sideBarBox.css({'min-height': this.$sideBarAside.height() });
      this.offset = this.$el.offset().top + parseInt(this.$el.css('paddingTop'), 10);
      this.offsetBottom = this.$cut.offset().top - this.$sideBarAside.height() - this.padding;
      (top) ? this.$htmlbody.animate({ scrollTop: top },250) : this.$htmlbody.animate({ scrollTop: this.$sideBarBox.offset().top - this.padding },0);
    },

    scrollDocument: function(e){
      var scrollTop = this.$document.scrollTop();
      if (scrollTop > this.offset) {
        this.$sideBarBox.addClass('fixed');
        this.firstFixed = false;
        if(scrollTop < this.offsetBottom) {
          this.$sideBarAside.removeClass('bottom').addClass('fixed');
        }else{
          this.$sideBarAside.removeClass('fixed').addClass('bottom');
        }
      }else{
        this.$sideBarAside.removeClass('fixed bottom');
        this.$sideBarBox.removeClass('fixed');
        this.firstFixed = true;
      }
    },

    updateSource: function(e){
      e && e.preventDefault();

      var params = {
        section: $(e.currentTarget).data('slug'),
        interesting: $(e.currentTarget).data('interesting')
      }

      mps.publish('SourceStatic/update',[params]);
    },

    changeSource: function(params){
      //spinner
      this.$sourceSpinner.removeClass('start');

      if (params.section) {
        var posY = (this.mobile) ? this.$document.scrollTop() : this.$sideBarBox.offset().top - this.padding;
        this.$htmlbody.animate({ scrollTop: posY },0, _.bind(function(){
            this.changeHelper(params.section);
        },this));
        mps.publish('Interesting/update',[params.interesting]);
      }else{
        if (!this.mobile) {
          var section = this.$navItem.eq(0).data('slug');
          this.changeHelper(section);
        }
        var interesting = this.$navItem.eq(0).data('interesting');
        mps.publish('Interesting/update',[interesting]);
      }

    },

    changeHelper: function(section){
      this.$sideBarBox.addClass('active');
      this.$backBtn.addClass('active');
      //aside
      this.$navItem.removeClass('selected');
      $('.'+section).addClass('selected');

      //section
      this.$sourceArticle.removeClass('selected');
      $('#'+section).addClass('selected');

      if(this.mobile) {
        this.$sideBarBox.animate({ scrollTop: 0 },0);
        this.$headerH1.addClass('active');
      }

      setTimeout(_.bind(function(){
        this.calculateOffsets();
      },this),50);

      setTimeout(_.bind(function(){

        //htmlbody
        if(this.mobile) {
          this.$sideBarBox.addClass('animate');
          this.$htmlbody.addClass('active');
        }
      },this),500);
    },

    returnBack: function(e){
      e && e.preventDefault();

      this.$headerH1.removeClass('active');
      this.$sideBarBox.removeClass('active');
      this.$backBtn.removeClass('active');
      this.$navItem.removeClass('selected');

      this.$htmlbody.removeClass('active').animate({ scrollTop: this.$sideBarAside.offset().top },0);

    },

    scrollTo: function(e){
      e && e.preventDefault();
      this.$htmlbody.animate({ scrollTop: 0 },500);
    }


  });

  return SidebarNavView;

});
