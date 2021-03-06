/*
Copyright 2016 Brian Alvarez

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

function linkify(){
  var treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), textNode;
  var nodes = [] //keep track of all the matching text nodes

  //looks for @username handles 
  var regexAt = /\@([a-zA-Z0-9\-\_]+)/g;
  //looks for "r&p: username" or "m/username" type mentions
  var regexRMP = /((?:[\"\ \/\;\:\&\-]|^)[mMrRpP][\:\/][\ ]?)([a-zA-Z0-9\-\_]+)/g;

  while(textNode = treeWalker.nextNode()) {
    if(textNode.parentElement.tagName !== 'SCRIPT') {
     if(textNode.nodeValue.search(regexAt) >= 0){
        nodes.push(textNode)
      }
      else if(textNode.nodeValue.search(regexRMP) >= 0){
        nodes.push(textNode) //keep track of every pattern match
      }
    }
  }


  //replace all the matching text in one go
  //this prevents issues where the tree is not traversed properly
  for (var i = 0; i < nodes.length; i++) {
    //console.log(nodes[i].parentElement.innerHTML)
    nodes[i].parentElement.innerHTML = nodes[i].parentElement.innerHTML
      .replace(regexAt, '<a href=/$1>@$1</a>')
      .replace(regexRMP, '$1<a href=/$2>$2</a>');
  }
}

//listen to messages from the background thread
//This allows us to re-run the linkfy code when
//RESTful APIs are called
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    if (request.feedUpdate)
      linkify(); //re-run the linkfying code
  });

linkify() //run on initial page load, required for static pages