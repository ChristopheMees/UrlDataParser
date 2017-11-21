import { equal } from 'assert';

import { nodeString, createNode } from '../src/parser';

describe("The nodeString function", () => {
  it("should return the correct string based on inputs", () => {
    const name = 'TestName';
    const description = 'TestDescription';
    const result = '<node name="TestName" description="TestDescription" valueNode="true"/>';

    equal(nodeString(name, description), result);
  })
});

describe("The createNode function", () => {
  it("should create a simple node, removing spaces", () => {
    const name = 'UN 0001';
    const description = 'TestDescription';
    const result = '<node name="UN0001" description="TestDescription" valueNode="true"/>';

    equal(createNode(name, description), result);
  })

  it("should create multiple nodes if the name is a range", () => {
    const name = 'UN 0001 to 0003';
    const description = 'TestDescription';
    const result ='<node name="UN0001" description="TestDescription" valueNode="true"/>\r\n<node name="UN0002" description="TestDescription" valueNode="true"/>\r\n<node name="UN0003" description="TestDescription" valueNode="true"/>';

    equal(createNode(name, description), result);
  })

  it("should handle a second UN in a range", () => {
    const name = 'UN 0001 to UN 0003';
    const description = 'TestDescription';
    const result ='<node name="UN0001" description="TestDescription" valueNode="true"/>\r\n<node name="UN0002" description="TestDescription" valueNode="true"/>\r\n<node name="UN0003" description="TestDescription" valueNode="true"/>';

    equal(createNode(name, description), result);
  })
});
