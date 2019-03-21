<template>
	<div :class="{loading: isLoading}" class="game-filed__cont">
      <div class="game-filed">
        <div class="game-filed__timer">
          <transition name="fade">
          	<timer v-if="!isLoading && showTimer" :time="20000" @onEnd="sendAnswer()"></timer>
          </transition>
        </div>
        <div class="game-filed__players">
          <div class="game-players">
            <div class="game-players__one">
              <player :points="userPoints"></player>
            </div>
            <div class="game-players__two">
              <player :isOpponent="true" :points="opponentPoints"></player>
            </div>
          </div>
        </div>
        <div class="game-filed__counter">
          <game-counter :current="questionsCounter" :total="totalCount"></game-counter>
        </div>
        <div class="game-filed__question">
          <div class="question">
            <div class="question__text">{{ questionText }}</div>
            <div class="question__answers">
              <div class="answers" :class="{'answers--disable': disable}">
                <div v-if="answers.length" v-for="answer in answers" class="answers__one">
                  <div @click="setAnswer(answer.id)" :class="{'answer--true': answer.id == trueAnwserID, 'answer--false': answer.id != trueAnwserID && answer.id == answerID && trueAnwserID, 'answer--opponent': answer.id == opponentAnswer, 'answer--player': answer.id == answerID}" class="answer" v-html="answer.text">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
	import store from "./store.vue";
	import is from "is_js";

	let ajaxErrorCounter = 0;

	export default {
		props: {

		},
		data: _ => ({
			userPoints: 0,
			opponentPoints: 0,
			isUserPointsCalced: true,
			isOpponentPointsCalced: true,

			opponent: {
				name: "Ваш противник",
				picLink: "",
			},

			answerID: 0,
			trueAnwserID: 0,
			questionsCounter: 1,
			opponentAnswer: 0,

			totalCount: store.state.gameMaxQuestions,
			isLoading: false,
			showTimer: true,

			answerInterval: null,
			disable: false,
			ajaxSendingNow: false,
		}),
		mounted(){
			store.commit("setGameResult", {
				playerPoints: 0,
				opponentPoints: 0,
			});
		},
		beforeDestroy(){
			store.commit("clearOpponentProfile");

			this.answerID = 0;
			this.trueAnwserID = 0;
			this.questionsCounter = 1;
			this.opponentAnswer = 0;
			
			clearInterval(this.answerInterval);
		},
		methods: {
			getAnswerResults(id){
				let result = [];

				if (id == this.trueAnwserID)
					result.push("правильный ответ");

				if (id != this.trueAnwserID && this.answerID && this.trueAnwserID)
					result.push("неправильный ответ");

				if (id == this.opponentAnswer)
					result.push("ответ противника");

				if (id == this.answerID)
					result.push("ваш ответ");

				return result.join(", ")
			},
			setAnswer(id){
				this.answerID = id;
				this.isOpponentPointsCalced = false;
				this.isUserPointsCalced = false;
			},

			calcResults(){
				if (this.trueAnwserID == this.opponentAnswer && !this.isOpponentPointsCalced){
					this.isOpponentPointsCalced = true;
					this.opponentPoints++;
				}

				if (this.trueAnwserID == this.answerID && !this.isUserPointsCalced){
					this.isUserPointsCalced = true;
					this.userPoints++;
				}
			},

			sendAnswer(){
				this.isLoading = true;
				this.showTimer = false;

				if (this.disable || this.ajaxSendingNow)
					return;

				let self = this;

				self.disable = true;

				this.answerInterval = setInterval(_ => {
				if (!this.ajaxSendingNow)
					$.ajax({
						url: store.state.ajaxFilePath,
				        type: "POST",
				        data: {
				          NEXT_QUESTION: "Y",
				          USER_ID: store.state.userID,
				          ID_QUESTION: self.currentQuestion.idQuestion,
				          ID_ANSWER: self.answerID,
				        },
				        beforeSend(){
				        	console.log({
								NEXT_QUESTION: "Y",
						          USER_ID: store.state.userID,
						          ID_QUESTION: self.currentQuestion.idQuestion,
						          ID_ANSWER: self.answerID,
							})
							self.ajaxSendingNow = true;
				        },
				        success(result){
				        	let res = JSON.parse(result);

				        	console.log(res);

				        	ajaxErrorCounter = 0;

				        	if (res.GAME.QUESTION.SUCCESS){				        
				        		switch (res.GAME.QUESTION.SUCCESS){
				        			case "wait":
				        				// if (res.GAME.QUESTION.ANSWER)
					        			// 	if (res.GAME.QUESTION.ANSWER.CORRECT_ID){
						        		// 		self.trueAnwserID = +res.GAME.QUESTION.ANSWER.CORRECT_ID;

						        		// 		if (res.GAME.QUESTION.RIVAL.ANSWER_ID)
						        		// 			self.opponentAnswer = res.GAME.QUESTION.RIVAL.ANSWER_ID;

						        		// 		self.isLoading = false;
						        		// 	}
						        		// self.calcResults();
						        		// return;
					        		break;

					        		case "endGame":
					        			if (typeof(res.GAME.QUESTION.BALLS) != undefined && typeof(res.GAME.QUESTION.BALLS_RIVAL) != undefined){
					        				store.commit("setGameResult", {
												playerPoints: res.GAME.QUESTION.END_GAME.BALLS,
												opponentPoints: res.GAME.QUESTION.END_GAME.BALLS_RIVAL,
											});

											self.isLoading = false;

											if (res.GAME.QUESTION.ANSWER)
						        				if (res.GAME.QUESTION.ANSWER.CORRECT_ID){
							        				self.trueAnwserID = +res.GAME.QUESTION.ANSWER.CORRECT_ID;

							        				if (res.GAME.QUESTION.RIVAL.ANSWER_ID)
							        					self.opponentAnswer = res.GAME.QUESTION.RIVAL.ANSWER_ID;
							        			}

							        		self.calcResults();

											clearInterval(self.answerInterval);

											setTimeout(_ => {
							        			self.disable = false;
							        			self.showTimer = true;
												store.commit("setState", "result");

												if (res.GAME.QUESTION.END_GAME.GAME.USER){
													//используется для записи новых баллов пользователя
													store.commit("setProfile", res.GAME.QUESTION.END_GAME.GAME.USER);
												}

							        		}, 3500)

											return;
					        			}
					        		break;
				        		}
				        	}

				        	if (res.GAME.QUESTION.NEXT_QUESTION){
				        		self.isLoading = false;
				        		self.showTimer = false;

				        		console.log(res.GAME.QUESTION.RIVAL.ANSWER_ID);

		        				if (res.GAME.QUESTION.RIVAL.ANSWER_ID != null){
		        					self.opponentAnswer = res.GAME.QUESTION.RIVAL.ANSWER_ID;

		        					if (res.GAME.QUESTION.ANSWER)
				        				if (res.GAME.QUESTION.ANSWER.CORRECT_ID){
					        				self.trueAnwserID = +res.GAME.QUESTION.ANSWER.CORRECT_ID;

					        				if (res.GAME.QUESTION.RIVAL.ANSWER_ID)
					        					self.opponentAnswer = res.GAME.QUESTION.RIVAL.ANSWER_ID;

					        				self.isLoading = false;
					        			}

		        					self.calcResults();

					        		clearInterval(self.answerInterval);

					        		setTimeout(_ => {
					        			self.questionsCounter++;
					        			self.answerID = 0;
					        			self.trueAnwserID = 0;
					        			self.opponentAnswer = 0;

					        			if (is.ios() || is.mac()){
						        			store.commit("setCurQuestion", {
						        				text: "",
						        				answers: []
						        			});
						        			// store.commit("setCurQuestion", res.GAME.QUESTION.NEXT_QUESTION);
						        			self.$forceUpdate();
					        			}	
					        			self.disable = false;
					        			self.showTimer = true;

					        			setTimeout(_ => {
					        				if (is.ios() || is.mac()){
						        				store.commit("setCurQuestion", {
							        				text: "",
							        				answers: []
							        			});
						        				self.$forceUpdate();
						        			}
					        				store.commit("setCurQuestion", res.GAME.QUESTION.NEXT_QUESTION);

					        				if (is.ios() || is.mac()){
					        					self.$forceUpdate();
					        				}
					        			}, 10)
					        		}, 3500)
		        				}

		        				if (res.GAME.QUESTION.ANSWER)
			        				if (res.GAME.QUESTION.ANSWER.CORRECT_ID)
				        				self.trueAnwserID = +res.GAME.QUESTION.ANSWER.CORRECT_ID;
				        	}
				        },
				        error(result){
				        	ajaxErrorCounter++;

					    	if (ajaxErrorCounter >= 3){
					    		clearInterval(self.answerInterval);

					    		store.commit("showMessage", {
						    	    messageText: "При отправке запроса возникла ошибка.<br /> Проверьте соединение с интернетом и попробуйте ещё раз.",
						    	    messageType: "warning",
						    	    showTime: 0,
						    	    btnText: "OK",
						    	    onClick(){
						    	      store.commit("hideMessage");
						    	      store.commit("setState", "profile");
						    	    }
						    	})
					    	}
				        },
				        complete(result){
				        	// self.isLoading = false;
				        	self.ajaxSendingNow = false;
				        }
					});
				}, 2000)
			}
		},
		computed: {
			currentQuestion(){
				return this.$store.state.gameCurQuestion;
			},
			answers(){
				return this.currentQuestion.answers || [];
			},
			questionText(){
				return this.currentQuestion.text;
			}
		},
	}
</script>

<style lang="sass">
	.game-filed__timer
		position: absolute
		top: 0
		left: 50%
		transform: translate(-50%, -50%)
		display: block

	.answer
		position: relative

		&__results
			position: absolute
			top: calc(100% + 2px)
			left: 0
			width: 100%
			text-align: center

	.answers--disable
		pointer-events: none
</style>