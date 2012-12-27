(function(object, name, depth){

  var oldRoot;
	var newRoot = window;
	var rootName = "window";
	var domObjs = (function(){
		var panel = document.createElement("div");
		panel.id = "flatglob";

		var ps = panel.style;
		ps.position="absolute";
		ps.border="3px solid #000";
		ps.top="5px";
		ps.left="5px";
		ps.padding="5px";
		ps.width="300px";
		ps.background="#c00";
		ps.color="#fff";
		ps.zIndex=99999;

		var css = document.createElement("style");
		css.type = "text/css";
		css.innerHTML = "#flatglob { "
			 + "position:absolute; border: 3px solid #000; top: 5px; left: 5px; padding: 5px; width: 300px; "
			 + "-moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; text-align: left;}"
		 + "#flatglob * {"
			 + "-moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; color: #fff; font-size: 12px; line-height:12px;}"
		 + "#flatglob label {"
			 + "display: block; width: 100%; margin: 5px 0px 0px 0px;}"
		 + "#flatglob input {"
			 + "display: block; width: 100%; margin: 5px 0px 0px 0px; color: #911;}"
		 + "#flatglob h3 {"
			 + "color: #fff;font-size: 16px;margin: 0;padding: 0 0 3px 0;text-align: center;border-bottom: 2px solid #900; line-height: 16px;}"
		 + "#flatglob #results {"
			 + "border-top: 2px solid #900; margin: 5px 0 0 0; padding: 5px; background: #fff; display: none; overflow: scroll;}"
		 + "#flatglob #FlatGlOb_start {"
			 + "border: 2px solid #fcc; margin: 5px 0 0 0; padding: 5px; background: #900; display: inline; color: #fff; width: auto;}"
		 + "#flatglob #results span.match {"
			 + "font-weight: bold; color: #400}"
		 + "#flatglob #results * {"
			 + "color: #500; white-space: nowrap;}"
		 + "#flatglob #results div {"
			 + "margin-top:5px;}"
		 + "#flatglob #results span.key {"
			 + "margin-left:7px;padding-left:7px;border-left:12px solid #f00}";
		document.body.appendChild(css);

//{ -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; }

		panel.innerHTML = "<h3>FlatGlOb</h3>"
			+"<label for='FlatGlOb_query'>Query</label>"
			+"<input id='FlatGlOb_query'>"
			+"<label for='FlatGlOb_root'>Root object <span style='font-size:10px;color:#fcc;font-height:12px;'>(default: window)</span></label>"
			+"<input id='FlatGlOb_root'>"
			+"<input type='button' id='FlatGlOb_start' value='search'>"

			+"<div id='results'></div>";

		var queryInput = panel.querySelector("#FlatGlOb_query");
		var rootInput = panel.querySelector("#FlatGlOb_root");
		var startButton = panel.querySelector("#FlatGlOb_start");

		var resultsDiv = panel.querySelector("#results");

		document.body.appendChild(panel);

		return {
			queryInput : queryInput,
			rootInput : rootInput,
			startButton : startButton,
			resultsDiv : resultsDiv
		};
	})();

	domObjs.rootInput.addEventListener("change", function(){
		try
		{
			newRoot = eval(this.value);
			rootName = this.value;
		}
		catch(e)
		{
			alert("invalid root object");
		}
	});

	domObjs.startButton.addEventListener("click", function(){
		if(newRoot !== oldRoot)
		{
			oldRoot = newRoot;
			flattenAndIndexObject(newRoot,rootName,7);
		}
		domObjs.resultsDiv.style.display = "block";
		domObjs.resultsDiv.innerHTML += queryData(domObjs.queryInput.value);
	});

	//END UI CODE

	//START ACTUALLY USEFUL SHIT

	var indexedObjects = [];
	function flattenAndIndexObject(object, name, depth){
		var remainingOnCurrentLevel = 1;
		depth = depth || 10;

		function objsPush(k,v,d)
		{
			indexedObjects.push({
				k:k,v:v,d:d
			});
		}

		(function dive(obj,name,howMuchDeeper)
		{
			var currObj;
			var currObjName;
			var currObjToString;

			var isArr = obj instanceof Array;
			var isObj;

			var preDelim = isArr?"[":".";
			var postDelim = isArr?"]":"";

			if(howMuchDeeper)
			{
				for(var i in obj)
				{
					if((obj.hasOwnProperty && obj.hasOwnProperty(i)) && 
						(function(){try{typeof obj[i];return true;}catch(e){}})(obj,i))
					{
						currObj = obj[i];
						isObj = false;

						switch(currObj && typeof currObj)
						{

							//Strings
							case "":
							case "string":
								currObjToString = currObj?currObj:"[ empty string ]";
								break;

							//True
							case "boolean":
								currObjToString = "[ true ]";
								break;

							//Falsey
							case false:
								currObjToString = "[ false ]";
								break;

							case null:
								currObjToString = "[ null ]";
								break;

							case undefined:
								currObjToString = "[ undefined ]";
								break;

							//Numbers
							case 0:
								currObjToString = "0";
								break;

							case "number":
								currObjToString = currObj.toString();
								break;

							//Objects
							case "object":
								isObj = true;
								if(currObj.toString)
								{
									currObjToString = currObj.toString();
								}
								break;

							//Objects
							case "function":
								//note to self: deal with this later
								break;

							default:
								//debugger;
								//console.log("\n\n    HIT DEFAULT OBJECT TYPE WITH: ",currObj,"\ntypeof: ",typeof currObj,"\nat: ",name + '["' + i + '"]',"\n\n");
								break;
						}

						if(i.indexOf(".")!==-1)
							currObjName = name + '["' + i + '"]';
						else
							currObjName = name + preDelim + i + postDelim;

						if(currObjToString)
						{
							objsPush(currObjName,currObjToString,depth-howMuchDeeper);
						}

						if(isObj && howMuchDeeper && !(currObj instanceof Window) && !(currObj instanceof HTMLElement))
						{
							dive(currObj,currObjName,howMuchDeeper - 1);
						}
					}
				}
			}
		})(object, name, depth);
		indexedObjects.sort(function(a,b){return a.d-b.d;});
	}

	function queryData(query){
		var html = "";
		var keyOpen = "<span class='key'>";
		var valueOpen = "<span class='value'>";
		var matchOpen = "<span class='match'>";
		var spanClose = "</span>";
		var divO = "<div>";
		var divC = "</div>";
		debugger;
		for(var i = 0, currObj; currObj = indexedObjects[i]; i++)
		{
			var key = currObj.k.toString();
			var value = currObj.v.toString();
			var keyIndex = key.indexOf(query);
			var valueIndex = value.indexOf(query);
			var keyMatched = keyIndex !== -1;
			var valueMatched = valueIndex !== -1;

			// if(valueMatched || keyMatched)
			// 	html+=key + " = " + value + "<br>";

			if(valueMatched && keyMatched)
			{
				html +=
				divO + 
				valueOpen + value.substr(0, valueIndex) + matchOpen + 
					value.substr(valueIndex, query.length) + spanClose + 
					value.substr(valueIndex+ query.length) + spanClose +

				keyOpen + key.substr(0, keyIndex) + matchOpen + 
					key.substr(keyIndex, query.length) + spanClose + 
					key.substr(keyIndex+ query.length) + spanClose +
				divC;
			}
			if(valueMatched)
			{
				html +=
				divO + 
				valueOpen + value.substr(0, valueIndex) + matchOpen + 
					value.substr(valueIndex, query.length) + spanClose + 
					value.substr(valueIndex+ query.length) + spanClose +

				keyOpen + key + spanClose + 
				divC;
			}
			if(keyMatched)
			{
				html +=
				divO + 
					valueOpen + value + spanClose +

				keyOpen + key.substr(0, keyIndex) + matchOpen + 
					key.substr(keyIndex, query.length) + spanClose + 
					key.substr(keyIndex+ query.length) + spanClose + 
				divC;
			}
		}
		return html;
	}

})(window, "window", 2);
