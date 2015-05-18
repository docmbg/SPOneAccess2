$SP().plugin('peopleahead',{
  selector:'#people-picker',
  onselect:function() {
    var $this=$(this);
    alert($this.data('name')+" ("+$this.data('email')+") has been selected");
  }
});