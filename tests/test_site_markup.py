"""Regression checks for the Python-to-Node translation boundary."""
import json
import unittest

from site_markup import copy_tables


class CopyTablesTests(unittest.TestCase):
    def test_large_unicode_tables_round_trip_without_command_line_limits(self):
        message = "\u0633\u0639\u0631 \u0627\u0644\u0633\u0648\u0644\u0627\u0631 \U0001f680" * 4000
        source = (
            "const T = {ar: {message: " + json.dumps(message, ensure_ascii=False) + "}};\n"
            "const FAQS = [{q_ar: T.ar.message, a_ar: 'ok'}];\n"
            "// \u2500\u2500 PDF config"
        )
        self.assertGreater(len(source), 32767)
        tables = copy_tables(source)
        self.assertEqual(tables['T']['ar']['message'], message)
        self.assertEqual(tables['FAQS'], [{'q_ar': message, 'a_ar': 'ok'}])


if __name__ == '__main__':
    unittest.main()
