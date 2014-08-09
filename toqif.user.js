// ==UserScript==
// @name        toqif
// @namespace   https://github.com/alick9188
// @description Export Thu ecard transactions to QIF file
// @include     http://ecard.tsinghua.edu.cn/user/UserExDetails.do
// @version     0.9
// ==/UserScript==

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||(navigator.msSaveBlob&&navigator.msSaveBlob.bind(navigator))||(function(h){var r=h.document,l=function(){return h.URL||h.webkitURL||h},e=h.URL||h.webkitURL||h,n=r.createElementNS("http://www.w3.org/1999/xhtml","a"),g="download" in n,j=function(t){var s=r.createEvent("MouseEvents");s.initMouseEvent("click",true,false,h,0,0,0,0,0,false,false,false,false,0,null);t.dispatchEvent(s)},o=h.webkitRequestFileSystem,p=h.requestFileSystem||o||h.mozRequestFileSystem,m=function(s){(h.setImmediate||h.setTimeout)(function(){throw s},0)},c="application/octet-stream",k=0,b=[],i=function(){var t=b.length;while(t--){var s=b[t];if(typeof s==="string"){e.revokeObjectURL(s)}else{s.remove()}}b.length=0},q=function(t,s,w){s=[].concat(s);var v=s.length;while(v--){var x=t["on"+s[v]];if(typeof x==="function"){try{x.call(t,w||t)}catch(u){m(u)}}}},f=function(t,u){var v=this,B=t.type,E=false,x,w,s=function(){var F=l().createObjectURL(t);b.push(F);return F},A=function(){q(v,"writestart progress write writeend".split(" "))},D=function(){if(E||!x){x=s(t)}if(w){w.location.href=x}v.readyState=v.DONE;A()},z=function(F){return function(){if(v.readyState!==v.DONE){return F.apply(this,arguments)}}},y={create:true,exclusive:false},C;v.readyState=v.INIT;if(!u){u="download"}if(g){x=s(t);n.href=x;n.download=u;j(n);v.readyState=v.DONE;A();return}if(h.chrome&&B&&B!==c){C=t.slice||t.webkitSlice;t=C.call(t,0,t.size,c);E=true}if(o&&u!=="download"){u+=".download"}if(B===c||o){w=h}else{w=h.open()}if(!p){D();return}k+=t.size;p(h.TEMPORARY,k,z(function(F){F.root.getDirectory("saved",y,z(function(G){var H=function(){G.getFile(u,y,z(function(I){I.createWriter(z(function(J){J.onwriteend=function(K){w.location.href=I.toURL();b.push(I);v.readyState=v.DONE;q(v,"writeend",K)};J.onerror=function(){var K=J.error;if(K.code!==K.ABORT_ERR){D()}};"writestart progress write abort".split(" ").forEach(function(K){J["on"+K]=v["on"+K]});J.write(t);v.abort=function(){J.abort();v.readyState=v.DONE};v.readyState=v.WRITING}),D)}),D)};G.getFile(u,{create:false},z(function(I){I.remove();H()}),z(function(I){if(I.code===I.NOT_FOUND_ERR){H()}else{D()}}))}),D)}),D)},d=f.prototype,a=function(s,t){return new f(s,t)};d.abort=function(){var s=this;s.readyState=s.DONE;q(s,"abort")};d.readyState=d.INIT=0;d.WRITING=1;d.DONE=2;d.error=d.onwritestart=d.onprogress=d.onwrite=d.onabort=d.onerror=d.onwriteend=null;h.addEventListener("unload",i,false);return a}(self));

/*global saveAs: false, Blob: false, window: false */
// We follow the IIFE pattern.
(function () {
    "use strict";
    var t, tb, td;
    t = window.document.getElementsByClassName('table1')[1];
    tb = t.children[0]; // tbody which holds all data rows
    td = t.parentNode.parentNode.previousSibling.previousSibling.children[0];
    td.innerHTML = '<input type="button" id="toqif" value="QIF" />';
    td.style.textAlign = 'right';
    td.onclick = function () {
        var trs, filecontent, datetrancnt,
            k, tr, place, inout, termnum, date, tran,
            dateline, tranline, memoline, srcline, clearline, endline,
            today, b, name;
        trs = tb.getElementsByTagName('tr');
        filecontent = "!Type:Oth A\n";
        // Record the ordinal number of a transaction in a day.
        datetrancnt = {};
        for (k = 1; k < Math.min(trs.length, 21); k += 1) {
            tr = trs[k];
            place = tr.children[1].children[0].innerHTML;
            inout = tr.children[2].children[0].innerHTML;
            termnum = tr.children[3].children[0].innerHTML;
            date = tr.children[4].children[0].innerHTML;
            tran = tr.children[5].children[0].innerHTML;
            if (datetrancnt[date] === undefined) {
                datetrancnt[date] = 1;
            } else {
                datetrancnt[date] += 1;
            }
            dateline = "D" + date.split('-').reverse().join('/') + "\n";
            tranline = "T" + ((inout === '领取圈存') ? '+' : '-') + tran.substring(1) + "\n";
            memoline = "M" + datetrancnt[date] + '.在' + place + '终端' + termnum + inout + "\n";
            if (inout === '消费') {
                if (/超市/.test(place)) {
                    srcline = 'L[支出:食品杂货]\n';
                } else {
                    srcline = 'L[支出:用餐]\n';
                }
            } else if (inout === '领取圈存') {
                srcline = 'L[中国银行借记卡]\n';
            } else if (inout === '自助缴费(学生公寓水费)') {
                srcline = 'L[支出:水电费:水]\n';
            } else {
                srcline = 'L[支出:杂项]\n';
            }
            clearline = "CR\n";
            endline = "^\n";
            filecontent += dateline + tranline + memoline + srcline + clearline;
            filecontent += endline;
        }

        today = new Date();
        b = new Blob([filecontent], {type: 'text/plain;charset=utf-8'});
        name = '校园卡.qif';
        //console.log(filecontent);
        saveAs(b, name);
    };
}());
