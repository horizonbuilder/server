import 'jest';
import routeHelpers from '../_helpers';

describe('routes : _helpers', () => {
  describe('parseBodyRequiredValues', () => {
    it('should return an object with all values', () => {
      let body = {
        one: 1,
        two: 2,
        three: 3
      };
      let values = routeHelpers.parseBodyRequiredValues(body, ['one', 'two', 'three']);
      expect(values).toHaveProperty('one');
      expect(values).toHaveProperty('two');
      expect(values).toHaveProperty('three');
    });

    it('should throw error if a key is not included in the body', () => {
      let body = {
        one: 1
      };
      expect(() => {
        routeHelpers.parseBodyRequiredValues(body, ['one', 'two']);
      }).toThrowError("missing required value: 'two'");
    });

    it('should throw error if a value is empty', () => {
      let body = {
        one: 1,
        two: ''
      };
      expect(() => {
        routeHelpers.parseBodyRequiredValues(body, ['one', 'two']);
      }).toThrowError("missing required value: 'two'");
    });
  });

  describe('filterBody', () => {
    it('should return an object with only the keys passed', () => {
      let body = {
        one: 1,
        two: 2,
        three: 3
      };
      let values = routeHelpers.filterBody(body, ['one', 'two']);
      expect(values).toHaveProperty('one');
      expect(values).toHaveProperty('two');
      expect(values).not.toHaveProperty('three');
    });

    it('should return an object with the keys passed that are in the body', () => {
      let body = {
        one: 1,
        two: 2
      };
      let values = routeHelpers.filterBody(body, ['one', 'two', 'four', 'five']);
      expect(values).toHaveProperty('one');
      expect(values).toHaveProperty('two');
    });
  });

  xdescribe('parseFilters', () => {
    it('should create where clause for search param', () => {
      let where = routeHelpers.parseFilters({ search: 'searchterm' });
      let whereString = where.toString();
      expect(whereString).toBe(
        `(description ILIKE '%searchterm%' OR grantor ILIKE '%searchterm%' OR grantee ILIKE '%searchterm%')`
      );
    });

    it('should create where clause for months_ago param', () => {
      let where = routeHelpers.parseFilters({ months_ago: 12 });
      let whereString = where.toString();
      let date = new Date();
      date.setMonth(date.getMonth() - 12);
      expect(whereString).toBe(`sale_date > date '${date.toLocaleDateString('en-US')}'`);
    });

    it('should create where clause for counties param', () => {
      let where = routeHelpers.parseFilters({ counties: 'york,seward,cass' });
      let whereString = where.toString();
      expect(whereString).toBe('LOWER(county) = ANY(\'{"york","seward","cass"}\')');
    });

    it('should lowercase counties in params', () => {
      let where = routeHelpers.parseFilters({ counties: 'York,sEwArD,CASS' });
      let whereString = where.toString();
      expect(whereString).toBe('LOWER(county) = ANY(\'{"york","seward","cass"}\')');
    });

    it('should create where clause for acres param (min and max)', () => {
      let where = routeHelpers.parseFilters({ acres: '0,10' });
      let whereString = where.toString();
      expect(whereString).toBe('total_acres > 0 AND total_acres < 10');
    });

    it('should create where clause for acres param (just min)', () => {
      let where = routeHelpers.parseFilters({ acres: '0' });
      let whereString = where.toString();
      expect(whereString).toBe('total_acres > 0');
    });

    it('should create where clause for cost param (min and max)', () => {
      let where = routeHelpers.parseFilters({ cost: '0,10' });
      let whereString = where.toString();
      expect(whereString).toBe('cost_per_acre > 0 AND cost_per_acre < 10');
    });

    it('should create where clause for cost param (just min)', () => {
      let where = routeHelpers.parseFilters({ cost: '0' });
      let whereString = where.toString();
      expect(whereString).toBe('cost_per_acre > 0');
    });

    it('should create where clause for months_ago AND end_date', () => {
      let where = routeHelpers.parseFilters({ months_ago: 12, end_date: '1/1/2001' });
      let whereString = where.toString();
      expect(whereString).toBe(`sale_date > date '1/1/2000' AND sale_date < date '1/1/2001'`);
    });

    it('should create where clause for start_date', () => {
      let where = routeHelpers.parseFilters({ start_date: '1/1/2001' });
      let whereString = where.toString();
      expect(whereString).toBe(`sale_date > date '1/1/2001'`);
    });

    it('should create where clause for end_date', () => {
      let where = routeHelpers.parseFilters({ end_date: '1/1/2001' });
      let whereString = where.toString();
      expect(whereString).toBe(`sale_date < date '1/1/2001'`);
    });

    it('should create where clause for polygon', () => {
      let polygon =
        '[[[-97.505223,40.883633],[-97.515995,40.883308],[-97.50827,40.87247],[-97.503163,40.873314],[-97.505223,40.883633]]]';
      let where = routeHelpers.parseFilters({ polygon: polygon });
      let whereString = where.toString();
      expect(whereString).toBe(
        `ST_Within( coords, ST_GeomFromText( 'POLYGON((-97.505223 40.883633,-97.515995 40.883308,-97.50827 40.87247,-97.503163 40.873314,-97.505223 40.883633))', 4326 ) )`
      );
    });

    it('should create where clause for all params (with months_ago)', () => {
      let where = routeHelpers.parseFilters({
        search: 'test',
        months_ago: 12,
        start_date: '1/1/1900',
        end_date: '1/1/2000',
        counties: 'york,cass',
        acres: '0,10',
        cost: '0'
      });
      let whereString = where.toString();
      expect(whereString).toBe(
        `(description ILIKE '%test%' OR grantor ILIKE '%test%' OR grantee ILIKE '%test%') AND sale_date > date \'1/1/1999\' AND sale_date < date \'1/1/2000\' AND LOWER(county) = ANY(\'{"york","cass"}\') AND total_acres > 0 AND total_acres < 10 AND cost_per_acre > 0`
      );
    });

    it('should create where clause for all params (without months_ago)', () => {
      let where = routeHelpers.parseFilters({
        search: 'test',
        start_date: '1/1/1900',
        end_date: '1/1/2000',
        counties: 'york,cass',
        acres: '0,10',
        cost: '0'
      });
      let whereString = where.toString();
      let date = new Date();
      date.setMonth(date.getMonth() - 12);
      expect(whereString).toBe(
        `(description ILIKE '%test%' OR grantor ILIKE '%test%' OR grantee ILIKE '%test%') AND sale_date > date \'1/1/1900\' AND sale_date < date \'1/1/2000\' AND LOWER(county) = ANY(\'{"york","cass"}\') AND total_acres > 0 AND total_acres < 10 AND cost_per_acre > 0`
      );
    });
  });

  describe('polygon util', function() {
    it('should return a proper polygon string', () => {
      let polygonString = routeHelpers.polygonAsWKT('[[[0.0,1.0],[2.0,3.0],[4.0,5.0]]]');
      expect(polygonString).toEqual('POLYGON((0.0 1.0,2.0 3.0,4.0 5.0))');
    });

    it('should return a proper polygon string for input with a hole', () => {
      let polygonString = routeHelpers.polygonAsWKT(
        '[[[[0.0,1.0],[2.0,3.0],[4.0,5.0],[0.0,1.0]],[[0.0,0.1],[2.0,3.0],[0.0,0.1]]]]'
      );
      expect(polygonString).toEqual(
        'POLYGON((0.0 1.0,2.0 3.0,4.0 5.0,0.0 1.0),(0.0 0.1,2.0 3.0,0.0 0.1))'
      );
    });

    it('should return a proper polygon string for input with multiple holes', () => {
      let polygonString = routeHelpers.polygonAsWKT(
        '[[[[0.0,1.0],[2.0,3.0],[4.0,5.0],[0.0,1.0]]],[[[0.0,0.1],[2.0,3.0],[0.0,0.1]],[[4.0,5.0],[6.0,7.0],[4.0,5.0]]]]'
      );
      expect(polygonString).toEqual(
        'POLYGON((0.0 1.0,2.0 3.0,4.0 5.0,0.0 1.0),(0.0 0.1,2.0 3.0,0.0 0.1),(4.0 5.0,6.0 7.0,4.0 5.0))'
      );
    });

    it('should return a proper polygon string for input with empty hole', () => {
      let polygonString = routeHelpers.polygonAsWKT(
        '[[[[-97.511,40.882],[-97.512,40.882],[-97.511,40.882]]],[]]'
      );
      expect(polygonString).toEqual('POLYGON((-97.511 40.882,-97.512 40.882,-97.511 40.882))');
    });

    it('should return a proper polygon string for input with a hole (real world example)', () => {
      let realPolyOneHole = [
        [
          [
            [-97.51846790313722, 40.88363680062696],
            [-97.50696659088136, 40.8837016920655],
            [-97.50726699829103, 40.875946714670356],
            [-97.51859664916992, 40.87614141141369],
            [-97.51846790313722, 40.88363680062696]
          ]
        ],
        [
          [
            [-97.51507759094238, 40.881527794238096],
            [-97.51151561737062, 40.88162513447379],
            [-97.5134038925171, 40.87834793448534],
            [-97.51507759094238, 40.881527794238096]
          ]
        ]
      ];
      let expectedPoly =
        'POLYGON((-97.51846790313722 40.88363680062696,-97.50696659088136 40.8837016920655,-97.50726699829103 40.875946714670356,-97.51859664916992 40.87614141141369,-97.51846790313722 40.88363680062696),(-97.51507759094238 40.881527794238096,-97.51151561737062 40.88162513447379,-97.5134038925171 40.87834793448534,-97.51507759094238 40.881527794238096))';

      let polygonString = routeHelpers.polygonAsWKT(JSON.stringify(realPolyOneHole));
      expect(polygonString).toEqual(expectedPoly);
    });
    it('should return a proper polygon string for input with multiple holes (real world example)', () => {
      let realPolyTwoHoles = [
        [
          [
            [-97.51649379730225, 40.884253266724215],
            [-97.5064516067505, 40.884253266724215],
            [-97.50675201416016, 40.877277131003915],
            [-97.51662254333498, 40.87750427258379],
            [-97.51649379730225, 40.884253266724215]
          ]
        ],
        [
          [
            [-97.51482009887697, 40.88327989657764],
            [-97.51237392425539, 40.88337723423653],
            [-97.5136184692383, 40.88139800703448],
            [-97.51482009887697, 40.88327989657764]
          ],
          [
            [-97.51095771789552, 40.88022991074936],
            [-97.50786781311037, 40.88010012100076],
            [-97.50984191894531, 40.878088347353184],
            [-97.51095771789552, 40.88022991074936]
          ]
        ]
      ];
      let expectedPoly =
        'POLYGON((-97.51649379730225 40.884253266724215,-97.5064516067505 40.884253266724215,-97.50675201416016 40.877277131003915,-97.51662254333498 40.87750427258379,-97.51649379730225 40.884253266724215),(-97.51482009887697 40.88327989657764,-97.51237392425539 40.88337723423653,-97.5136184692383 40.88139800703448,-97.51482009887697 40.88327989657764),(-97.51095771789552 40.88022991074936,-97.50786781311037 40.88010012100076,-97.50984191894531 40.878088347353184,-97.51095771789552 40.88022991074936))';

      let polygonString = routeHelpers.polygonAsWKT(JSON.stringify(realPolyTwoHoles));
      expect(polygonString).toEqual(expectedPoly);
    });
  });
});
