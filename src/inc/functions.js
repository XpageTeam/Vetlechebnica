export default {
	declination(a, b, c, s) { 
		var words = [a, b, c]; 
		var days = s % 100; 

		if (days >=11 && days <= 14) { days = 0; } 
		else { days = (days %= 10) < 5 ? (days > 2 ? 2 : days): 0; } 

		return(words[days]); 
	}
}