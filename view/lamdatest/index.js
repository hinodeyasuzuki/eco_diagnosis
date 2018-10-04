

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {
    //dummy('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Access-Control-Allow-Origin':'*',
            'Content-Type': 'application/json'
        },
    });



//done(null,"test ok");

/*
    switch (event.httpMethod) { 
        case 'DELETE':
            dynamo.deleteItem(JSON.parse(event.body), done);
            break;
        case 'GET':
            dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            break;
        case 'POST':
            dynamo.putItem(JSON.parse(event.body), done);
            break;
        case 'PUT':
            dynamo.updateItem(JSON.parse(event.body), done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
 */  

//done( null,event["body-json"] );

if ( event["body-json"] ){
    var cmd = event["body-json"];
}else{
    var cmd = { "get" : {"all" :1},"set":{} };
}


//var cmd = event.data;

//d6

function maxmeasure(n){
    if ( ret.measure.length <= n ) return;
    ret.measureorg = ret.measure;
    ret.measure = [];
    for( var i=ret.measureorg.length-1 ; i>=0 ; i-- ){
        if ( i<n ){
            ret.measure[i] =  ret.measureorg[i];
        }
    }
    delete ret.measureorg;
}

//基本構造構築
D6.constructor();


var key, key2;
if( cmd.set && cmd.set.add ) {
    for( key in cmd.set.add ){
        for( key2 in cmd.set.add[key]){
            D6.addConsSetting(key);
        }
    }
}

//変数の設定
if( cmd.set && cmd.set.inp ) {
    for( key in cmd.set.inp ){
		D6.inSet(key,cmd.set.inp[key]);
    }
}

//計算
D6.calculateAll();

//対策の追加
if( cmd.set && cmd.set.measureadd ) {
    for( key in cmd.set.measureadd ){
		D6.measureAdd( cmd.set.measureadd[key] );
    }
    D6.calcMeasures(-1);
}

//取得データ
var ret = {};
if ( cmd.get.all ){
    ret = D6.getAllResult();
    maxmeasure(15);
} else {
    //個別の取得
    if ( !cmd.get.target || (cmd.get.target && cmd.get.target.substr(0,4) != "cons") ) cmd.get.target = "consTotal";
    if( cmd.get.common){
        ret.common = D6.getCommonParameters();
    }
	//月ごとの消費量
    if( cmd.get.monthly){
        ret.monthly = D6.getMonthly();
    }
	//平均値
    if( cmd.get.average ){
        ret.average = D6.getAverage(cmd.get.target);
    }
	//平均値に関するグラフ表示
    if( cmd.get.average_graph ){
        ret.average_graph = D6.getAverage_graph();
    }
	//分野
    if( cmd.get.itemize ){
        ret.itemize = D6.getItemize(cmd.get.target);
    }
	//分野グラフ
    if( cmd.get.itemize_graph ){
        ret.itemize_graph = D6.getItemizeGraph(cmd.get.target);
    }
	//対策（最大15項目）
    if( cmd.get.measure ){
        ret.measure = D6.getMeasure(cmd.get.target);
        maxmeasure(15);
    }
	//対策すべて
    if( cmd.get.measure_all ){
        ret.measure = D6.getMeasure(cmd.get.target);
    }
	//個々の対策の詳細
    if( cmd.get.measure_detail ){
        ret.measure_detail = D6.getMeasureDetail( cmd.get.detail );	
    }
	//入力ページ生成
    if( cmd.get.input_page ){
        if ( cmd.get.input_page == 1 ) cmd.get.input_page = cmd.get.target;
        ret.input_page = D6.getInputPage( cmd.get.target, cmd.get.input_page );	
    }
	//データ構造
    if( cmd.get.scenario ){
        ret.scenario = D6.scenario;
        ret.scenario.defInput = {};
        ret.scenario.defSelectValue = {};
        ret.scenario.defSelectData = {};
        for( var key in D6.scenario.defInput ){
            ret.scenario.defInput[key] = D6.scenario.defInput[key] ;	
        }
        for( key in D6.scenario.defSelectValue ){
            ret.scenario.defSelectValue[key] = D6.scenario.defSelectValue[key];
        }
        for( key in D6.scenario.defSelectData ){
            ret.scenario.defSelectData[key] = D6.scenario.defSelectData[key];
        }
    }
}

done(null ,ret);

        
};
