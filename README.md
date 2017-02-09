#Omar BERRABEH
# Vimeo Search feed
Vimeo Search feed is aan aapplication to find filter top vimeo's video

![N|image](http://i.imgur.com/Bs2L5Gi.png)

##  Technical description ##
 - Vimeo Search feed adopt the functionnel programming paradigm  to  resolve the probleme to find/filter
 - EcmaScript 2015 (6) with baabel to ensure that the code execute in browser that has only support for ecmascript 5
 - Sass  with smacss + Bootstrap
 - Gulp for faast building the JS
 - Small application  nodejs to  server the html and  js over http protocol
 - Yarn as dependency maanager


## Get the compiled version ##
A folder  demo has created  to test without compile and launch the server application.There is 2 files html
  - index.html to view the application with js in Ecmaascript 2016
  - appBabel.html to view the application with jss compiled (babel traaspile)

## Compile  the application  ##
 To view the application with compilation of the assets you should follow thoses steps:
   - Install yarn
   - Execute the commnd yarn on root  folder
   - execute the command yarn run start
   - access to this url  aafter the build is finished: http://localhost:8000

```sh
$ yarn
$ yarn run start
```

You can also:
  - change the port listen of the server in server/config.js


License
----

MIT