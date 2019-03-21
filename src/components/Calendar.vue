<template>
    <div class="calendar">
        <div class="calendar__top">
            <div class="calendar__top-months">
                <select v-model="selectedMonth" class="calendar-select">
                    <option v-for="month in months" :value="month.num" >{{ month.text }}</option>
                </select>
            </div>
            <!-- <div class="calendar__top-years">
                <select v-model="selectedYear" class="calendar-select">
                    <option v-for="year in years" >{{ year }}</option>
                </select>
            </div> -->
            <div class="calendar__top-arrows">
                <button @click.prevent="selectedMonth--" class="calendar-arrow calendar-arrow--prev"></button>
                <button @click.prevent="selectedMonth++" class="calendar-arrow calendar-arrow--next"></button>
            </div>
        </div>
        <div class="calendar__middle">
            <div class="calendar-grid">
                <table>
                    <thead>
                        <tr>
                            <th v-if="dates.length" v-for="date in dates[0]" :class="['weekday--'+date.isoWeekday, ]" ><span>{{ date.weekDay }}</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- <tr>
                            <td class="past"><span>7</span></td>
                        </tr>
                        <tr>
                            <td class="selected-day"> <span>8</span></td>
                        </tr>
                        <tr>
                            <td class="highlighted-day"><span>15</span></td>
                        </tr> -->
                        <tr v-for="days in dates">
                            <td @click="selectedDay = day.text" v-for="day in days" :class="[day.cssClass, 'weekday--'+day.isoWeekday]" > 
                                <span>{{ day.text }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import moment from "moment"
import _ from "lodash"

import Store from './store.vue'

export default {
    name: 'Calendar',
    props : {
        type : {
            type : String,
            default : '',
        },
        value : {
            type : String,
            default : '',
        },
    },
    data : () => ({
        selectedMonth : moment(Store.state.selectedDate).month()+1,
        selectedYear : moment(Store.state.selectedDate).format('YYYY'),
        selectedDate : Store.state.selectedDate,
        selectedDay : moment(Store.state.selectedDate).date(),
    }),
    mounted () {
        if (this.value) {
            this.selectedDate = this.value;
            var m = moment(this.selectedDate, 'YYYY-MM-DD');
            this.selectedMonth = +m.format('M');
            this.selectedYear = +m.format('YYYY');
            this.selectedDay = m.date();
        }
    },
    watch : {
        value (val, oldVal) {
            this.selectedDate = val;
            if (this.selectedDate) {
                var m = moment(this.selectedDate, 'YYYY-MM-DD');
                this.selectedMonth = +m.format('M');
                this.selectedYear = +m.format('YYYY');
                this.selectedDay = m.date();
            }
        },
        selectedDate (val, oldVal) {
            this.$store.commit("setSelectedDate", val)

            this.$emit('input', val);
        },
        selectedMonth (val, oldVal) {
            if (val < 1) {
                // this.selectedYear--;
                this.selectedMonth = 1;
            }
            if (val > 12) {
                // this.selectedYear++;
                this.selectedMonth = 12;
            }
        },
        selectedYear (val, oldVal) {
            if (!~this.years.indexOf(+val)) {
                this.selectedYear = oldVal;
            }
            var m = moment(this.selectedDate, 'YYYY-MM-DD');
            m.year(this.selectedYear);
            this.selectedDate = m.format('YYYY-MM-DD');
        },
        selectedDay (day, oldVal) {
            var m = moment(this.selectedDate, 'YYYY-MM-DD');
            m.year(this.selectedYear);
            m.month(this.selectedMonth-1);
            m.date(day);
            this.selectedDate = m.format('YYYY-MM-DD');
        },
    },
    computed : {
        years () {
            var year = 2018, years = [], lastYear = +moment().format('YYYY')+10;
            year = 2017;
            while (year < lastYear) {
                years.push(++year);
            }
            return years;
        },
        months () {
            var months = [], m = moment();

            m.locale("ru")

            for (var i = 0; i < 12; i++) {
                m.month(i);
                months.push({
                    num : +m.format('M'),
                    text : _.capitalize(m.format('MMMM')),
                });
            }
            return months;
        },
        weeksCnt () {
            return this.dates.length > 1 ? 1 : _.chunk(this.dates[0], 7);
        },
        dates () {
            var dates = [], day, m = moment(), weekDays = [
                'Пн',
                'Вт',
                'Ср',
                'Чт',
                'Пт',
                'Сб',
                'Вс',
            ];
            m.year(this.selectedYear).month(this.selectedMonth-1).date(1);
            var days = [];
            if (this.type != 'inline') {
                var mPrev = moment();
                mPrev.year(this.selectedYear).month(this.selectedMonth-1).date(1);
                mPrev.subtract(m.isoWeekday(), 'days');

                window.mPrev = mPrev

                for (var i = 1; i < m.isoWeekday(); i++) {
                    mPrev.add(1, 'day');
                    days.push({
                        cssClass : 'past',
                        text : mPrev.date(),
                        weekDay : weekDays[mPrev.isoWeekday()-1],
                        isoWeekday : mPrev.isoWeekday(),
                    });
                }
            }

            var mCur = moment();
            var cssClass, date;

            while (m.format('M') == this.selectedMonth) {
                cssClass = '';
                if (this.selectedDate && m.isSame(moment(this.selectedDate, 'YYYY-MM-DD'), 'day'))
                    cssClass += ' selected-day '

                if (this.selectedDate && m.isBefore(moment(moment().format(), 'YYYY-MM-DD'), 'day'))
                    cssClass += ' past '

                days.push({
                    cssClass : cssClass,
                    text : m.date(),
                    weekDay : weekDays[m.isoWeekday()-1],
                    isoWeekday : m.isoWeekday(),
                });

                m.add(1, 'day');
            }
            return this.type == 'inline' && window.matchMedia("screen and (min-width: 660px)").matches ? [days] : _.chunk(days, 7);
        },
    }
}
</script>

<style lang="sass" scoped>
    .past
        pointer-events: none !important
</style>