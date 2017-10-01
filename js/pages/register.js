;define(["jquery","mustache"],function($,mus){
   function RegisterPage(){
       this.hasInit=false;
   }

   RegisterPage.prototype={
       constructor:RegisterPage,
       init:function(options){
           this.hasInit=true;
           this.container=options.container||$("#main-content");
           this.pageUrl="./temPages/registerPage.html";
           this.accountInput="#input-account";
           this.passwordInput="#input-pwd";
           this.passwordConfirmInput="#input-pwd-confirm";
           this.regBtn="#btn-register";
           this.loginLink="#link-login";
       },
       loadHtml:function(){
           var $def=$.Deferred();
           var context=this;
           var container=context.container;
           $.get(context.pageUrl,function(temp){
               var renderPage=mus.render(temp);
               container.html(renderPage);
               $def.resolve(context);
           })
           return $def.promise();
       },
       bindEvents:function(context){
           context=context||this;
           var $def=$.Deferred();
           $(context.regBtn).bind("click",function(e){
               var account=$(context.accountInput).val();
               var pwd=$(context.passwordInput).val();
               var pwdConfirm=$(context.passwordConfirmInput).val();
               if(pwd!=pwdConfirm){
                   alert("两次输入密码不一致，请重新输入！");
                   return;
               }
               $.ajax({
                   url:window.app.apiUrl+"account",
                   type:"post",
                   dataType:"json",
                   data:{
                       "act":"register",
                       "str":JSON.stringify({
                           'account':account,
                           'pw':pwdConfirm
                       })
                   },
                   success:function(response){
                    if(response.Success){
                        alert("账号创建成功，页面跳转中！");
                        setTimeout(function(){
                            context.unstall();
                            window.app.router.toLogin();
                        },3000)
                    }else{
                        alert("账号创建失败："+response.Messsage+"！");
                    }
                   },
                   error:function(){
                       alert("数据访问异常/(ㄒoㄒ)/~~");
                   }
               })

           });
           $(context.loginLink).bind("click",function(e){
               context.unstall();
               window.app.router.toLogin();
           });
           $def.resolve();
           return $def.promise();
       },
       install:function(){
           this.loadHtml().then(this.bindEvents);
       },
       unstall:function(context){
           context=context||this;
           $(context.regBtn).unbind();
           $(context.loginLink).unbind();
       }
   }
   return new RegisterPage();
});