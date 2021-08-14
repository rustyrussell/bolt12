"use strict"
class Recurrence{
    constructor(recurrence, recurrence_paywindow=null, recurrence_limit=null, recurrence_base=null){
        this.period = recurrence['period'];
        this.time_unit = recurrence['time_unit'];
        this.paywindow = recurrence_paywindow;
        this.limit = recurrence_limit;
        this.base = recurrence_base;
    }
    has_fixed_base() {
        return this.base!=null
    }
    can_start_offset(){
        return this.has_fixed_base && this.base['start_any_period']
    }
    _adjust_date(basedate, units, n, sameday){
        while(true){
            if (units == 'seconds'){
                var ret=new Date(basedate)
                ret.setSeconds(ret.getSeconds()+n);
            }
            else if (units == 'days'){
                var ret=new Date(basedate)
                ret.setDate(ret.getDate()+n);
            }
            else if (units == 'months'){
                var ret=new Date(basedate)
                ret.setMonth(ret.getMonth()+n);
            }
            else if (units == 'years'){
                var ret=new Date(basedate)
                ret.setMonth(ret.getMonth()+12*n);
            }
            if (!sameday || ret.getDate()==basedate.getDate())
                return ret;
            basedate.setDate(basedate.getDate()-1);
        }
    }
    _get_period(n, basetime){
        basedate=new Date(basetime);
        if (this.time_unit==0){
            var units = 'seconds';
            var sameday = false;
        }
        else if (this.time_unit==1){
            var units = 'days';
            var sameday = false;
        }
        else if (this.time_unit==2){
            var units = 'months';
            var sameday = true;
        }
        else if (this.time_unit==3){
            var units = 'years';
            var sameday = true;
        }
        
        var startdate = this._adjust_date(basedate, units, this.period*n, sameday);
        var enddate = this._adjust_date(startdate, units, this.period, sameday);

        var start = startdate.getTime();
        var end = enddate.getTime();

        if(this.paywindow==null){
            paystartdate = this._adjust_date(startdate, units, -this.period, 
                                            sameday);
            paystart=paystartdate.getTime();
            payend=end;
        }
        else{
            paystart = start-this.paywindow['seconds_before'];
            payend = start + this.paywindow['seconds_after'];
        }
        return {
                'start': start,
                'end': end, 
                'paystart':paystart, 
                'payend':payend
                }
    }
    get_period(n, basetime){
        if (this.limit!=null && n>this.limit){
            return null;
        }
        if (this.base!=null){
            basetime=this.base['basetime'];
        }
        return this._get_period(n, basetime);
    }
    get_pay_factor(period, time){
        if(this.paywindow==null || !this.paywindow['proportional_amount'])
            return 1;
        if(time<period['start'])
            return 1;
        if (time > period['end'])
            return 0;
        return (period['end']-time)/period['end']-period['start'];
    }
    period_start_offset(){
        
    }
} 
var d = new Date(0);
console.log(d);
var ret=new Date(d);
console.log(ret);
// var res=new Date();

// d.setDate(d.getDate()-1)
// console.log(res);


// let recurrence={
//     'period':56,
//     'time_unit':0
// }
// let test=new Recurrence(recurrence);
// test.has_fixed_base()
// var test=new Date(1456740100000);
// var basedate=new Date(2021,2,14);
// var ret=new Date(1970,1,1)
// // ret=ret.setTime(basedate.getTime()+(24*60*60*1000))
// console.log(ret.toUTCString())