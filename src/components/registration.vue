<template>
  <div>
    <div class="popup-form fancybox-content" id="registration" :class="{
          'ajax-processed' : $store.state.ajaxProcessed,
          'ajax-processed-popup' : $store.state.ajaxProcessed,
      }">
      <div class="popup-form__title">Запись на приём</div>
      <div class="popup-form__content">
        <div class="service">
          <form @submit.prevent="submit" action="#" >
            <div class="service__item service__item--full">
              <div class="service__item-title">Выберите дату и время</div>
              <div class="service__item-content">
                <div class="service__item-calendar">
                   <calendar v-model="selectedDate"></calendar>
                   <input type="hidden" name="date" v-model="selectedDate">
                </div>
                <div class="service__item-time">
                  <div class="service__input-cont service__input-cont--doctor service__input-cont--select">
                    <select v-model="selectedDoctorID" reuired="" name="doctorId" class="service__input service__input--select">
                      <option disabled value="0">Выберите врача</option>
                      <option v-for="doctor in doctors" :value="doctor.id">{{ doctor.name }} - {{ doctor.position }}</option>
                    </select>
                    <label class="service__label">Доктор</label>
                  </div>
                  <div v-if="selectedDoctorID" class="service__input-cont--address service__input-cont--doctor">
                    {{ doctors.filter(doc => doc.id == selectedDoctorID)[0].address }}
                  </div>
                  <div class="service__radio-group service__radio-group--time">
                    <div v-for="time in timeArray" class="service-radio">
                      <input class="service-radio__input" :disabled="isUnactiveTime(time)" v-model="selectedTime" name="timeFrom" type="radio" :value="time" :id="'time'+time"/>
                      <label class="service-radio__label" :for="'time'+time"> {{ time }} </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="service__item service__item--full">
              <div class="service__item-title">Информация о Вас</div>

              <div class="service__item-inputs">
                <div class="service__input-cont">
                  <input placeholder="Ваше имя" name="name" class="service__input" type="text"/>
                  <label class="service__label">Ваши ФИО</label>
                  <div class="forms__error-message"></div>
                </div>
                <div class="service__input-cont">
                  <input placeholder="Телефон" inputmode="tel" data-mask="phone" size="25" pattern='\+7\s\([0-9]{3}\)\s[0-9]{3}-[0-9]{2}-[0-9]{2}' name="phone" required="" class="service__input" type="tel"/>
                  <label class="service__label">Телефон</label>
                  <div class="forms__error-message"></div>
                </div>
                <div class="service__input-cont">
                  <input placeholder="Ваш e-mail" name="email" required="" pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$" inputmode="email" class="service__input" type="email"/>
                  <label class="service__label">Ваш e-mail</label>
                  <div class="forms__error-message"></div>
                </div>
                <div class="service__input-cont">
                  <div class="service__item-checkbox">
                    <div class="checkbox">
                      <input id="firstVisit" type="checkbox" name="firstVisit" class="checkbox__input">
                      <label for="firstVisit" class="checkbox__label">Первый раз в клинике</label>
                      <div class="forms__error-message"></div>
                    </div>
                  </div>
                </div>
                <div class="service__input-cont service__input-cont--textarea">
                  <textarea placeholder="Текст" name="text" class="service__input"></textarea>
                  <label class="service__label">Вид, возраст, вес <br> животного</label>
                  <div class="forms__error-message"></div>
                </div>
                <div class="service__input-cont service__input-cont--textarea">
                  <textarea required="" placeholder="Комментарий" name="comment" class="service__input"></textarea>
                  <label class="service__label">Цель обращения</label>
                  <div class="forms__error-message"></div>
                </div>
              </div>
              <div class="service__item service__item--submit">
                <div v-if="$store.state.personalDataText" class="service__item-checkbox"  v-html="$store.state.personalDataText">
                  <!-- <div class="checkbox"> -->
                    <!-- <input :id="'reg-confirm-'+_uid" required type="checkbox" class="checkbox__input"> -->
                    <!-- <label :for="'reg-confirm-'+_uid" class="checkbox__label"></label> -->
                    <!-- <div class="forms__error-message"></div> -->
                  <!-- </div> -->
                </div>
                <input @click="checkForm" class="default-btn" type="submit" value="Записаться"/>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div v-if="$store.state.error" class="error__block">
          <div class="error">
              <div class="error__text">
                  <div class="text-page">
                      <p>При загрузке данных произошла ошибка.</p>
                      <p>Попробуйте ещё раз.</p>
                  </div>
              </div>
              <div class="error__btn">
                  <button @click.prevent="$store.commit('setSelectedDate'); reload()" class="btn btn--news">Повторить</button>
              </div>
          </div>
      </div>
    </div>
    <div v-if="showMessage" class="popup-form fancybox-content popup-form--message" id="result-message">
      <div class="message">
        <div v-if="messageTitle" class="message__title">{{ messageTitle }}</div>
        <div v-if="messageText" class="message__text" v-html="messageText"></div>
        <div class="message__btn">
          <a href="javascript:;" @click.prevent="closeMessage()" class="default-btn">ОК</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import IMask from "imask"
  import moment from "moment"

  export default {
    name: "registration",
    props: {
      time: {
        type: String,
        default: ""
      },
      doctorID: {
        type: String,
        default: ""
      },
      date: {
        type: String,
        default: ""
      }
    },
    data: _ => ({
      selectedDate: "",
      selectedTime: "",
      ajaxProcessed: false,
      selectedDoctorID: "0",

      showMessage: false,
      messageTitle: "",
      messageText: ""
    }),
    watch: {
      selectedDoctorID(val, oldVal){
        if (this.isUnactiveTime(this.selectedTime))
          this.selectedTime = this.curDoctorTime[0]
      },
      selectedTime(val, oldVal){
        if (this.isUnactiveTime(val))
          this.selectedTime = this.curDoctorTime[0]
      },
      showMessage(val, oldVal){
        const self = this;

        if (val == true)
          setTimeout(_ => {
            $.fancybox.open({
              src: "#result-message",
              trapFocus: false,
              touch: false,
              afterClose(){
                self.showMessage = false
                self.messageTitle = ""
                self.messageText = ""

                self.$emit("update")
              }
            })
          }, 100)
      }
    },
    mounted(){
      this.selectedDate = this.date
      this.selectedTime = this.time
      this.selectedDoctorID = this.doctorID

      setTimeout(_ => {
        let $conts = $(".service__input-cont");

        $conts.each((i, el) => {
          let $this = $(el),
            $label = $this.find(".service__label"),
            $input = $this.find(".service__input");

          $input.css({
            width: "calc(100% - "+$label.width()+"px)"
          })
        })

        ;(function(){
          let popupContent = document.querySelector(".fancybox-slide .popup-form__content");

          if (!popupContent || popupContent.closest("#message"))
            return

          if (popupContent.clientHeight < popupContent.scrollHeight)
            popupContent.classList.add("has-scrollbar")
        })()

        this.formValidate()
      }, 200)

      
    },
    computed: {
      doctors(){
        return this.$store.state.doctors
      },
      timeRows(){
          return this.$store.state.timeArray
      },
      curDoctorTime(){
        const time = this.$store.state.doctors.filter(item => item.id == this.selectedDoctorID)

        return time.length ? time[0].new_free : []
      },
      timeArray(){
        return this.$store.state.timeArray
      }
    },
    methods: {
      reload(){
        location.reload()
      },
      isUnactiveTime(time){
        return this.curDoctorTime.filter(item => item == time).length ? false : true
      },
      checkForm(e){
        if (!validateForm())
          e.preventDefault()
      },

      closeMessage(){
        $.fancybox.close()
      },

      submit(e){
        const data = new FormData(e.target),
          self = this;

        data.append("date", this.selectedDate)
        data.append("test", 'Y')
        data.append("timeTo", this.getNextTime(this.selectedTime))
        data.append("command", "SaveClaim")

        // for (let key of data.entries())
        //   console.log(key[0] + ', ' + key[1]);

        if (this.selectedDoctorID == "0"){
          self.messageTitle = "Ошибка заполнения формы"
          self.messageText = "Вы не выбрали врача, к которому хотите записаться."
          self.showMessage = true

          return
        }

        $.ajax({
          url: "https://vetlechebnica74.ru/api/",
          type: "POST",
          processData: false,
          contentType: false,
          data: data,
          dataType: "json",
          beforeSend(){
            self.ajaxProcessed = true;
          },
          success(result){
            const getYear = date => {
              const day = (new Date(self.selectedDate).getDate()).toString().length == 1 
                            ? "0"+ new Date(self.selectedDate).getDate() 
                            : new Date(self.selectedDate).getDate(),
                month = (new Date(self.selectedDate).getMonth() + 1).toString().length == 1
                          ? "0"+(new Date(self.selectedDate).getMonth() + 1)
                          : (new Date(self.selectedDate).getMonth() + 1),
                year = new Date(self.selectedDate).getFullYear();
              
              return day+"."+month+"."+year
            };


            if (result.save_claim)
              if (result.save_claim.status == "success"){

                self.messageTitle = "Вы успешно записаны на приём"
                self.messageText = "Ждём вас "+getYear(self.selectedDate)+" в "+self.selectedTime+"."
                self.showMessage = true

                return
              }

            if (result.save_claim){
              if (result.save_claim.status == "error"){
                // alert(result.save_claim.message)
                self.messageTitle = "Ошибка при записи"
                self.messageText = result.save_claim.message
                self.showMessage = true
                console.error(result)
              }
            }else{
              // alert("При записи произошла ошибка")
              self.messageTitle = "Ошибка при записи"
              self.messageText = "При записи произошла ошибка. <br /> Попробуйте позже."
              self.showMessage = true
              console.error(result)
            }

            // self.$emit("update")
            if (this.$store.state.yaCounter)
              this.$store.state.yaCounter.reachGoal('FORM_WRITING')

          },
          complete(result){
            console.log(result)
            self.ajaxProcessed = false;
          },
          error(result){
            self.messageTitle = "Ошибка при записи"
            self.messageText = "При записи произошла ошибка. <br /> Попробуйте позже."
            self.showMessage = true
            console.error(result)
          }
        })
      },
      getDoctorByID(id){
        return this.$store.state.doctors.filter(item => item.id == id)[0]
      },
      getNextTime(time){
        // var d1 = new Date (),
        //   d2 = new Date ( d1 );
        //   d2.setMinutes ( d1.getMinutes() + 30 );

        return moment(this.$store.state.selectedDate+"T"+time+":00.00").add("minutes", this.$store.state.timeStep / 1000 / 60).format("HH:mm")
      },
      formValidate(){
        ;(function(){
          let mask = document.querySelectorAll("[data-mask]");

          if (!mask.length)
            return

          for (var ms of mask){
            switch (ms.getAttribute("data-mask")){
              case 'phone':
                new IMask (ms, {
                  mask: '+{7} (000) 000-00-00',
                  lazy: false
                })

              break;

              case 'date':
                new IMask(ms, {
                  mask: Date,
                })
            }
          }
        })()

        ;(function(){
          const inputs = document.querySelectorAll(".service__input, .service__item-checkbox .checkbox__input");

          if (!inputs.length)
            return

          for (var input of inputs)
            input.addEventListener("blur", function(){
              if (this.value)
                this.classList.add("js__have-content")
              else
                this.classList.remove("js__have-content")

              checkValidity(this)
            })
        })()

        ;(function(){
          const textBlocks = document.querySelectorAll(".service__input-cont--textarea textarea")

          if (!textBlocks.length)
            return

          for (var tb of textBlocks)
            tb.addEventListener("focus", _ => {
              $(".has-scrollbar").animate({
                scrollTop: 100000
              }, 100)
            })
        })()
      }
    }
  }


  const checkValidity = input => {
    const parent = input.closest("div"),
      errorMessageElement = parent.querySelector(".forms__error-message");

    if (input.checkValidity()){
      input.classList.remove("forms__input--error")
      parent.classList.remove("js__have-error")

      if (errorMessageElement)
        errorMessageElement.innerText = ""

      return true
    }else{
      if (errorMessageElement)
        errorMessageElement.innerText = input.validationMessage

      input.classList.add("forms__input--error")
      parent.classList.add("js__have-error")

      console.log(input)

      return false
    }
  },
  validateForm = _ => {
    const inputs = document.querySelectorAll(".service__input");
    let status = true;

    if (!inputs.length)
      return

    for (var input of inputs){
      let result = checkValidity(input);
      status = status ? result : false
    }

    return status
  }
</script>

<style lang="sass" scoped>
  .calendar
    margin: 0 !important

  .checkbox__label:after
    background: url("https://vetlechebnica74.ru/local/templates/vet/img/ico-checked.svg") center no-repeat

  .checkbox
    position: relative
    max-width: 350px

    &__input
      display: block !important
      position: absolute
      top: 0
      left: 0
      opacity: 0
      pointer-events: none

    &__label
      display: block

  .popup-form--message
    max-width: 100%
    width: 500px

  .service__item

    &--submit
      position: sticky
      bottom: 0
      margin: 0
      padding: 20px 0 0
      background: #fff
      display: flex
      justify-content: center

      .default-btn

        &:not(:first-child)
          margin-left: auto

    &-inputs
      display: flex
      flex-wrap: wrap
      margin: 0 0 -16px -16px

      .service__input

        &-cont
          width: calc((100% - 16px * 2) / 2)
          margin: 0 0 16px 16px

          &:empty
            opacity: 0

  .default-btn
    display: inline-block
    text-align: center
    padding: 10px 15px 11px
    color: #fff
    border: none
    background: #31c5bd
    border-radius: 10px

  *::-webkit-input-placeholder
    color: #adb4c6
    opacity: 0 !important

  *:-moz-placeholder
    color: #adb4c6
    opacity: 0 !important

  *::-moz-placeholder
    color: #adb4c6
    opacity: 0 !important

  *:-ms-input-placeholder
    color: #adb4c6
    opacity: 0 !important
  
  @media screen and (max-width: 660px)
    *::-webkit-input-placeholder
      color: #adb4c6
      opacity: 1 !important

    *:-moz-placeholder
      color: #adb4c6
      opacity: 1 !important

    *::-moz-placeholder
      color: #adb4c6
      opacity: 1 !important

    *:-ms-input-placeholder
      color: #adb4c6
      opacity: 1 !important

    

  .message
    text-align: center

    &__title
      font-size: 22px

      &:not(:last-child)
        margin-bottom: 15px

    &__text
      font-size: 17px

    &__btn
      margin-top: 20px

      .default-btn
        text-decoration: none 

</style>