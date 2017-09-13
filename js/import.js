;(function($,win){
    win.$import=function(url){
        var scriptUrl="<script type='text/javascript' src='"+url+"'></script>";
       document.write(scriptUrl);
    }
})(jQuery,window);