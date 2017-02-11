import Express from 'express';
import path from 'path';
import serverConfig  from './config';


// initiaalize the Express App
const app = new Express();


const renderHtml  =  () => {
	return `<!doctype html>
			<html>

			<head>
			    <title> Vimeo Search </title>
			    <link href='https://fonts.googleapis.com/css?family=Lato:400,300,700' rel='stylesheet' type='text/css'>
			    <link href="/static/css/styles.css" rel="stylesheet" type="text/css">

			    
			</head>

			<body>
			    <header id="header" class="header">
			        <div class="container">
			            <div class="row">
			                <div class="col-xs-12 col-md-3">
			                    <h1 class="vim-logo"><span class="vim-logo-first"> Vimeo </span><span class="vim-logo-second"> Seacrh </span>  </h1>
			                </div>
			                <div class="col-xs-12 col-md-9">
			                    <form id="vim-search" class="vim-search">
			                        <input id="vim-search-inp" class="vim-search-inp" placeholder="Search Vimeo video" />
			                        <button> <span class="glyphicon glyphicon-search" aria-hidden="true"></span> </button>
			                    </form>
			                </div>
			            </div>
			        </div>
			    </header>
			    <main id="vim-feeds">
			        <div class="container">
			        	<div class="vim-navigation">
							<nav class="navbar navbar-default">
								<div class="container-fluid">
									<ul class="nav navbar-nav">
										<li class="dropdown">
										<select class="form-control" id="selectCountfeed">
											<option value="10">
												10
											</option>
											<option value="25">
												25
											</option>
											<option value="50">
												50
											</option>
										</select></li>
										<li>
											<form class="navbar-form navbar-left">
												<div class="checkbox">
													<label><input id="usermorelikes" type="checkbox">User more than 10 likes</label>
												</div>
											</form>
										</li>
									</ul><!-- /.navbar-collapse -->
								</div><!-- /.container-fluid -->
							</nav>
						</div>
			            <div class="row vim-feed-container" id="vim-feed-container">		           	             
			                
			            </div>
			            <div class="row"> 
			                <div class="vim-next"> 
			                    <button type="button" class="btn btn-primary btn-lg btn-block vim-next-btn" id="vim-next-btn">Next</button>  
			                </div> 
			            </div>
			        </div>
			    </main>
			    <script src="/static/js/rx.all.js"></script>
			    <script src="/static/js/vimdata.js"></script>
			    <script src="/static/js/app.js"></script>
			</body>

			</html> `;
			};



app.use('/static', Express.static(path.join(__dirname, 'public')))

//server rendering
app.use((req, res, next) => {
     res
          .set('Content-Type', 'text/html')
          .status(200)
          .end(renderHtml());
});


app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log(`Videmo Search application  is running on port: ${serverConfig.port}! Build , Best test :)!`); // eslint-disable-line
  }
});