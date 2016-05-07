import atom.data
import gdata.data
import gdata.contacts.client
import gdata.contacts.data

def PrintAllContacts(gd_client):
	gd_client = gdata.contacts.client.ContactsClient(source='YOUR_APPLICATION_NAME')
	
 	feed = gd_client.GetContacts()

	for i, entry in enumerate(feed.entry):
		print '\n%s %s' % (i+1, entry.name.full_name.text)

		if entry.content:
			print '    %s' % (en	try.content.text)
#end 