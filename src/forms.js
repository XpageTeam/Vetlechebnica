import IMask from "iMask"

document.addEventListener("DOMContentLoaded", e => {
	;(function(){
		let mask = document.querySelectorAll("[data-mask]");

		if (!mask.length)
			return

		for (var ms of mask){
			switch (ms.getAttribute("data-mask")){
				case 'phone':
					new IMask (ms, {
						mask: '+{7} (000) 000-00-00',
						// lazy: false
					})

				break;

				case 'date':
					new IMask(ms, {
						mask: Date,
					})
			}

			// if (!ms.hasAttribute("pattern") && ms.hasAttribute("required"))

		}
	})()

	;(function(){
		let inputs = document.querySelectorAll(".req-form__input, .forms__input, .checkbox__input");

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
})

const checkValidity = input => {
	let parent = input.closest("div"),
		errorMessageElement = parent.querySelector(".forms__error-message");

	if (input.checkValidity()){
		input.classList.remove("forms__input--error")

		errorMessageElement.innerText = ""
	}else{
		errorMessageElement.innerText = input.validationMessage

		input.classList.add("forms__input--error")
	}
}