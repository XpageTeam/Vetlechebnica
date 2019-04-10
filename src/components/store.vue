<script>
	import Vue from 'vue'
	import Vuex from 'vuex'
	import moment from 'moment'

	Vue.use(Vuex)

	export default new Vuex.Store({
	    state : {
	        selectedDate : moment().format("YYYY-MM-DD"),
	        timeArray: [],
	        timeStep: 1800000, //мс
	        ajaxProcessed: false,
	        erorr: false,
	        curAjax: false,
            personalDataText: "",
            yaCounter: typeof(yaCounter30204534) != "undefined" ? yaCounter30204534 : false,

	        doctors: [],
	    },
	    mutations : {
	        setSelectedDate (state, date = moment().format("YYYY-MM-DD")) {
	            state.selectedDate = date;

	            this.commit("loadData")
	        },
	        setDoctors(state, data){
	        	state.doctors = data
	        },
	        setTimeArray(state, array){
	        	state.timeArray = array
	        },
	        loadData(state){
	        	const self = this;

	            state.curAjax = $.ajax({
                    type: "post",
                    dataType: "json",
                    url: 'https://vetlechebnica74.ru/api/',
                    crossDomain: true,
                    data: {
                        command: "EmploeesTime",
                        dateFrom: state.selectedDate,
                        dateTo: state.selectedDate
                    },
                    beforeSend(){
                    	// if (state.curAjax)
                    	// 	state.curAjax.abort()
                    	state.ajaxProcessed = true
                    	state.error = false
                    },
                    success(response){
                    	console.log(response)
                        try{
                            const doctors = [],
                                times = response.TIMES.items,
                                workingTime = response.TIMES.workingTimes[0].new_free;

                            let step = moment(moment(state.selectedDate).format("YYYY-MM-DD")+"T"+workingTime[1]+":00.00") - moment(moment(moment(state.selectedDate).format("YYYY-MM-DD")+"T"+workingTime[0]+":00.00"));

                            state.timeStep = step;

                            self.commit("setTimeArray", workingTime)

                            for (var doctor of response.EMPLOEES.items){
                                if (!times[doctor.id])
                                    continue

                                doctors.push({
                                    id: doctor.id,
                                    name: doctor.name,
                                    phone: doctor.phone,
                                    email: doctor.email,
                                    position: times[doctor.id].dates[0].position || "---",
                                    free: times[doctor.id].dates[0].free,
                                    new_free: times[doctor.id].dates[0].new_free,
                                })
                            }

                            self.commit("setDoctors", doctors)
                        }catch(error){
                            console.error(error)
                            state.error = true
                        }
                    },
                    error(response){
                        console.log(response)
                        state.error = true
                    },
                    complete(){
                        state.ajaxProcessed = false
                    }
                })
	        }
	    }
	})
</script>