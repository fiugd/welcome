export default function (){
  return {
		ParamsComma: function(list) {
			return list.asIteration().children.map(c => c.toJS());
		},
		ParamsSpace: function(a,b,c,d) {
			return [a.toJS(),b.toJS(),c.toJS(), ...d.children.map(c => c.toJS())];
		},
		Slashed: function(a,b){
			return a ? b.toJS() : undefined;
		},
		HexColor: function(list){
			let source = this.sourceString;
			source = [3,4].includes(source.length)
				? source.split('').map(x => x+x)
				: source.match(/(.{1,2})/g);
			return source.map((x, i) => i < 3
				? parseInt(x, 16)
				: parseInt(x, 16)/255
			)
		},
		int: function(a) {
			return parseInt(this.sourceString,10);
		},
		float: function(a,b,c) {
			return parseFloat(this.sourceString);
		},
		percent: function(a,b) {
			return a.toJS() / 100;
		},
		degrees: function(a,b) {
			return a.toJS();
		},
		Color: function(a,b,c,d) {
			let space = a.source.sourceString.slice(a.source.startIdx, a.source.endIdx);
			if(space === '#') space = 'rgb';
			if(space.endsWith('a')) space = space.slice(0,-1);
			return {
				space,
				params: c.toJS()
			}
		}
	};
}
