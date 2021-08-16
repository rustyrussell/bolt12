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
        var basedate=new Date();
        basedate.setTime(basetime*1000)
        // console.log(basedate.toUTCString());
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
        
        var startdate = new Date();
        startdate.setTime( this._adjust_date(basedate, units, this.period*(n), sameday));
        var enddate = new Date();
        enddate.setTime( this._adjust_date(startdate, units, this.period, sameday));
        console.log(enddate.toUTCString());
        var start = startdate.getTime();
        var end = enddate.getTime();

        if(this.paywindow==null){
            var paystartdate = this._adjust_date(startdate, units, -this.period, 
                                            sameday);
            console.log('paystart:', paystartdate.toUTCString());
            var paystart=paystartdate.getTime();
            var payend=end;
        }
        else{
            var paystart = start - this.paywindow['seconds_before'];
            var payend = start + this.paywindow['seconds_after'];
        }
        return {
                'start': start/1000,
                'end': end/1000, 
                'paystart':paystart/1000, 
                'payend':payend/1000
                }
    }
    get_period(n){
        if (this.limit!=null && n>this.limit && n<=0){
            return null;
        }
        if (this.base!=null){
            var basetime=this.base['basetime'];
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
    period_start_offset(when){
        if(this.can_start_offset){
            if (this.time_unit==0){
                var approx_mul = 1;
            }
            else if (this.time_unit==1){
                var approx_mul = 24 * 60 * 60;
            }
            else if (this.time_unit==2){
                var approx_mul = 30 * 24 * 60 * 60;
            }
            else if (this.time_unit==3){
                var approx_mul = 365 * 30 * 24 * 60 * 60;
            }
            var period_num=(when-self.base['basetime'])/(self.period * approx_mul)
            while (true){
                period = self._get_period(period_num, self.base['basetime']);
                if(when < period['end']){
                    period_num -= 1;
                }
                else if (when >= this.period.end){
                    period_num += 1;
                }
                else{
                    return period_num;
                }
            }
        }
        else throw Error('can_start_offset is not true');
    }
} 
// var recur=new Recurrence({'period':10,'time_unit':0},null,1,{'basetime':31485600, 'start_any_perriod':0});
// console.log(recur.get_period(1))