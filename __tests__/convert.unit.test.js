import Convert from '@/convert';

describe('Convert test suite', function() {

    test('should create mapJson Object with title property', function() {

        let expected = 'This is an example map'
        let actual = `title ${expected}`;
        
        let result = new Convert().parse(actual);
        
        expect(result.title).toEqual(expected);

    });

    test('should create element from string', function(){

        let actual = 'component Customer [1, 0.4]\ncomponent Customer2 [0,0.1]';
        
        let obj = new Convert();
        let result = obj.parse(actual);
        
        expect(result.elements[0].id).toEqual(1);
        expect(result.elements[0].name).toEqual('Customer');
        expect(result.elements[0].visibility).toEqual('1');
        expect(result.elements[0].maturity).toContain('0.4');

        expect(result.elements[1].id).toEqual(2);
        expect(result.elements[1].name).toEqual('Customer2');
        expect(result.elements[1].visibility).toEqual('0');
        expect(result.elements[1].maturity).toContain('0.1');
  
      });

      test('should create links from string', function(){

        let actual = 'component Customer [1, 0.4]\ncomponent Customer2 [0,0.1]\nCustomer->Customer2';  
        
        let obj = new Convert();
        let result = obj.parse(actual);
        
        expect(result.links[0].start).toEqual('Customer');
        expect(result.links[0].end).toEqual('Customer2');
        expect(result.links[0].flow).toBeFalsy();
  
      });

      test('links should have flow attribute set', function(){

        let actual = 'component Customer [1, 0.4]\ncomponent Customer2 [0,0.1]\nCustomer+>Customer2'
  
        let obj = new Convert();
        let result = obj.parse(actual);
        
        expect(result.links[0].start).toEqual('Customer');
        expect(result.links[0].end).toEqual('Customer2');
        expect(result.links[0].flow).toBeTruthy();

      });

      test('links should have flow value attribute set', function(){

        let actual = 'component Customer [1, 0.4]\ncomponent Customer2 [0,0.1]'
        actual = actual + '\n';
        actual = actual + "Customer+'5.88'>Customer2";
  
        let obj = new Convert();
        let result = obj.parse(actual);
        
        expect(result.links[0].start).toEqual('Customer');
        expect(result.links[0].end).toEqual('Customer2');
        expect(result.links[0].flow).toBeTruthy();
        expect(result.links[0].flowValue).toEqual('5.88');

      });

      test('should ignore whitespace', function(){

        let actual = 'component Customer [1, 0.4]\ncomponent Customer2 [0,0.1]'
        actual = actual + '\r\n ';
        actual = actual + 'Customer->Customer2';
        actual = actual + '\r\n ';
        actual = actual + '\r\n ';
        actual = actual + '\r\n ';
  
        let obj = new Convert();
        let result = obj.parse(actual);
        
        expect(result.links[0].start).toEqual('Customer');
        expect(result.links[0].end).toEqual('Customer2');
  
      });

      test('should set evolution', function(){

        let actual = 'evolution Novel->Emerging->Good->Best'
  
        let obj = new Convert();
        let result = obj.parse(actual);
        
        expect(result.evolution[0].line1).toEqual('Novel');
        expect(result.evolution[1].line1).toEqual('Emerging');
        expect(result.evolution[2].line1).toEqual('Good');
        expect(result.evolution[3].line1).toEqual('Best');
  
      });

    test('should create map object with annotations property with an annotation with a single occurance', function() {

        let actual = 'annotation 1 [.38,.4] Standardising power allows Kettles to evolve faster';
        let result = new Convert().parse(actual);
        
        expect(result.annotations.length).toEqual(1);
        expect(result.annotations[0].number).toEqual(1);
        expect(result.annotations[0].occurances[0].visibility).toEqual(0.38);
        expect(result.annotations[0].occurances[0].maturity).toEqual(0.4);
        expect(result.annotations[0].text).toEqual('Standardising power allows Kettles to evolve faster');
    });

    test('should create map object with annotations property with an annotation with many occurances with no text', function() {

      let actual = 'annotation 1 [[.38, .4],[0.44, 0.33]]';
      let result = new Convert().parse(actual);
      
      expect(result.annotations.length).toEqual(1);
      expect(result.annotations[0].number).toEqual(1);
      expect(result.annotations[0].occurances[0].visibility).toEqual(0.38);
      expect(result.annotations[0].occurances[0].maturity).toEqual(0.4);
      expect(result.annotations[0].text).toEqual('');
  });

  test('should create map object with annotations property with an annotation with many occurances', function() {

    let actual = 'annotation 1 [[.38, .4],[0.44, 0.33],[0.11, 0.22] ]    Standardising power allows Kettles to evolve faster';
    let result = new Convert().parse(actual);
    
    expect(result.annotations.length).toEqual(1);
    expect(result.annotations[0].number).toEqual(1);
    expect(result.annotations[0].occurances[0].visibility).toEqual(0.38);
    expect(result.annotations[0].occurances[0].maturity).toEqual(0.4);
    expect(result.annotations[0].occurances[1].visibility).toEqual(0.44);
    expect(result.annotations[0].occurances[1].maturity).toEqual(0.33);
    expect(result.annotations[0].occurances.length).toEqual(3);
    expect(result.annotations[0].text).toEqual('Standardising power allows Kettles to evolve faster');
});

test('should create map object with map style data', function() {

  let actual = 'style wardley';
  let result = new Convert().parse(actual);
  
  expect(result.presentation.style).toEqual('wardley');
});

test('should create map object with annotations positional data', function() {

  let actual = 'annotations [.38, .4]';
  let result = new Convert().parse(actual);
  
  expect(result.presentation.annotations.visibility).toEqual(0.38);
  expect(result.presentation.annotations.maturity).toEqual(0.4);
});

test('should not create map object with annotations when incomplete', function() {

  let actual = 'annotation ';
  let result = new Convert().parse(actual);
  
  expect(result.annotations.length).toEqual(0);
});

test('should not create map object with annotations when incomplete', function() {

  let actual = 'annotation 1';
  let result = new Convert().parse(actual);
  
  expect(result.annotations.length).toEqual(0);
});

test('comments are ignored', function() {

  let actual = '// hello world.';
  let result = new Convert().parse(actual);
  
  expect(result.elements.length).toEqual(0);
});

});