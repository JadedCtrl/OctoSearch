default: all

all: popup

clean:
	rm pages/popup.js

popup:
	cat common.js pages/popup.src.js > pages/popup.js
