import ts from "typescript";
import { typescriptEnv } from "./tsUtils";

function createLineTrackingTransformer(context: ts.TransformationContext) {
  return (sourceFile: ts.SourceFile): ts.SourceFile => {
    // Function to create the "await line(lineNumber)" expression
    function createLineCall(lineNumber: number): ts.Expression {
      return ts.factory.createCallExpression(
        ts.factory.createIdentifier('line'),
        undefined,
        [ts.factory.createNumericLiteral(lineNumber)]
      );
    }

    // Function to add line tracking to a block
    function addLineTrackingToBlock(block: ts.Block | ts.SourceFile): ts.Block {
      const lineNumber = sourceFile.getLineAndCharacterOfPosition(block.getEnd()).line + 1;

      // Create the new statement for line tracking
      const lineTrackingStatement = ts.factory.createExpressionStatement(
        createLineCall(lineNumber)
      );

      // First transform all nested blocks by visiting each statement
      const transformedStatements: ts.Statement[] = [];

      // Explicitly ensure we're dealing with Statement[] at all times
      for (const statement of block.statements) {
        transformedStatements.push(visit(statement) as ts.Statement);
      }

      // Create a new block with the line tracking statement appended
      return ts.factory.createBlock([
        ...transformedStatements,
        lineTrackingStatement
      ]);
    }

    // Visitor function to process nodes
    function visit(node: ts.Node): ts.Node {
      // Process blocks recursively
      if (ts.isBlock(node) || ts.isSourceFile(node)) {
        return addLineTrackingToBlock(node);
      }

      // For non-block nodes, visit their children
      return ts.visitEachChild(node, visit, context);
    }

    // Apply the transformer to the source file
    return ts.visitNode(sourceFile, visit) as ts.SourceFile;
  };
}

// Function to transform source files
export function makeSafe(sourceCode: string): string {
  // Create a source file from the input code
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  // Create the transformer
  const result = ts.transform(
    sourceFile,
    [createLineTrackingTransformer]
  );

  // Get the transformed source file
  const transformedSourceFile = result.transformed[0];

  // Create a printer to convert the AST back to source code
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  // Print the transformed source file
  const transformedCode = printer.printNode(
    ts.EmitHint.Unspecified,
    transformedSourceFile,
    sourceFile
  );

  // Clean up
  result.dispose();

  return transformedCode;
}
